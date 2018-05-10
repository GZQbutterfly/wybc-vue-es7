import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { debounce, isNumber, isFunction } from 'lodash';

import { timeout, clientEnv } from 'common.env';

import BScroll from '../../../../../commons/assets/bscroll/bscroll';

import service from '../shelves.service';

import './shopcar.scss';
@Component({
    template: require('./shopcar.html')
})
export class ShelvesShopCar extends Vue {

    @Prop({
        type: Object, default: () => {
            return {
                list: [],
                countTotal: 0,
                totalPrice: 0,
                leastMoney: 0
            }
        }
    })
    opts;

    @Prop({ type: Object, default: () => { return {} } })
    carmap;

    isIos = clientEnv.ios;
    show = false;

    list = [];

    countType = 0;
    countTotal = 0;
    types = [];
    cartIds = [];

    _$service;

    mounted() {
        this._$service = service(this.$store);
        this._toast = this.$store.state.$toast;
        this.$nextTick(() => {
            this.renderSwiper();
        });

        window.addEventListener('resize', this.scrollHandler);
    }

    resize = false;
    listHeight = 0;
    scrollHandler() {
        console.log('shopcar resize');
        if (!this.show) {
            return;
        }
        console.log('shopcar resize1');
        if (!this.listHeight) {
            this.listHeight = this.$refs.listRef.offsetHeight;
        }
        if (this.resize) {
            // 第二次 resize
            this.$refs.listRef.style.height = this.listHeight + 'px';
        } else {
            // 第一次resize
            let bh = document.body.offsetHeight;
            this.$refs.listRef.style.height = (bh - 80) + 'px';
            let activeElement = document.activeElement;
            if (/input/i.test(activeElement.tagName)) {
                if (activeElement.scrollIntoViewIfNeeded) {
                    activeElement.scrollIntoViewIfNeeded(true);
                } else {
                    activeElement.scrollIntoView(true);
                }
            }
        }
        this.resize = !this.resize;
    }

    initPage() {
        document.activeElement.blur();
        this.list = [...this.opts.list]
        this.countTotal = this.opts.countTotal;
        this.diffList();
    }

    renderSwiper() {
        const scroll = this.scrollUI = new BScroll(this.$refs.listRef, {
            scrollbar: {
                fade: true
            },
            click: true
        });
    }


    diffList() {
        let _list = this.list;
        let _types = [];
        let len = _list.length;
        for (let i = 0; i < len; i++) {
            let _item = _list[i];
            if (!_item.maxBuyNum) {
                _item.maxBuyNum = 100;// TODO test
            }
            _types.push(_item.__number);
        }
        this.types = _types;
        this.countType = len;
    }

    setCartIds() {
        let _list = this.opts.list;
        let _cartIds = [];
        let len = _list.length;
        for (let i = 0; i < len; i++) {
            _cartIds.push(_list[i].id);
        }
        this.cartIds = _cartIds;
    }

    reDiffList(item, index) {
        let num = item.__number;
        let oldNum = this.types[index];
        let diffNum = num - oldNum;
        if (!diffNum) {
            // diffNum = 0;  num == oldNum  不处理
            return;
        }
        this.opts.countTotal = (this.countTotal += diffNum);
        this.opts.totalPrice += diffNum * item.moneyPrice;
        this.types[index] = num;

        let _result = null;
        if (num) {
            _result = this.$store.dispatch('UPD_GOODS_NUMBER_IN_CAR', { number: num, wholeShopCartId: item.id, goodsId: item.goodsId });
        } else {
            _result = this.$store.dispatch('CLEAN_SHOP_CAR', { wholeShopCartIds: item.id });
        }
        _result.then((res) => {
            let _result = res.data;
            if (!_result || _result.errorCode) {
                // 修改失败，还原操作
                item.__number = oldNum;
                this.opts.countTotal = (this.countTotal -= diffNum);
                this.opts.totalPrice -= diffNum * item.moneyPrice;
                this.types[index] = oldNum;
                this._toast({ success: false, title: _result.msg });
                return;
            } else {
                this.$set(this.carmap, item.goodsId, { number: num });
                if (!num) {
                    this.types.splice(index, 1);
                    this.opts.list.splice(index, 1);
                    this.list.splice(index, 1);
                    this.countType = this.list.length;
                    if (!this.list.length) {
                        this.$emit('cleanCar');
                        this.showContent();
                    }
                }
            }
        });
    }

    diffLeastMoney() {
        return this.opts.list.length && this.opts.leastMoney - this.opts.totalPrice > 0;
    }

    showContent() {
        let _self = this;
        timeout(() => {
            if (this.show) {
                this.show = false;
                this.$emit('triggerCar', false);
                return;
            }
            this.opts.list.length && this.$emit('queryCar', () => {
                if (this.opts.list.length) {
                    this.show = true;
                    this.$emit('triggerCar', true);
                    this.initPage();
                }
            });
        }, 100);
    }

    clean() {
        let _self = this;
        if (!_self.list.length) {
            return;
        }
        let dialogObj = {
            title: '提示',
            type: 'info',
            content: '是否清空进货单？',
            assistBtn: '取消',
            mainBtn: '确认',
            assistFn() { },
            mainFn() {
                _self.setCartIds();
                _self.$store.dispatch('CLEAN_SHOP_CAR', { wholeShopCartIds: _self.cartIds.join(',') }).then((res) => {
                    let _result = res.data;
                    if (!_result || _result.errorCode) {
                        return;
                    }
                    _self.opts.list = [];
                    _self.opts.countTotal = 0;
                    _self.opts.totalPrice = 0;
                    _self.list = [];
                    _self.types = [];
                    _self.countTotal = 0;
                    _self.countType = 0;
                    _self.$emit('cleanCar');
                    _self.showContent();
                });
            }
        }
        _self.$store.state.$dialog({ dialogObj });
    }

    getContentClass() {
        let opts = { 'show': this.show };
        if (!this.show && this.diffLeastMoney()) {
            opts.bottom = true;
        }
        return opts;
    }

    sub(item, index) {
        if (item.__number) {
            item.__number--;
            this.reDiffList(item, index);
        }
    }

    plus(item, index) {
        if ((+item.__number) < item.maxBuyNum) {
            item.__number++;
            this.reDiffList(item, index);
        }
    }

    input($event, item, index) {
        let _dom = $event.target;
        let _value = +_dom.value;
        if (_value > item.maxBuyNum) {
            _dom.value = item.maxBuyNum;
            item.__number = item.maxBuyNum;
        } else if (!_value || _value < 0) {
            _dom.value = '';
            item.__number = '';
        } else {
            item.__number = _value;
        }
    }

    blur(item, index) {
        if (!isNumber(item.__number)) {
            item.__number = 1;
        }
        this.reDiffList(item, index);
    }

    //结算
    balanceCar() {
        let _self = this;
        let len = this.opts.list.length;
        let stockFlag = false;
        if (!len) {
            let dialogObj = {
                title: '',
                content: '您未选中商品！！',
                assistBtn: '',
                mainBtn: '确定',
                type: 'info',
                mainFn() { }
            };
            this.$store.state.$dialog({ dialogObj });
            return;
        }
        this.setCartIds();
        this.$router.push({ path: 'cms_purchase_submit_order', query: { cartId: this.cartIds.join(','), orderSrouce: 'car', stockType: 1 } });
    }

    // 禁止touchmove
    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

    destroyed() {
        window.removeEventListener('resize', this.scrollHandler);
    }

}
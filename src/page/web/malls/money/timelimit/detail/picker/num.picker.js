import { Component, Vue, Watch } from 'vue-property-decorator';

require('./num.picker.scss');

@Component({
    template: require('./num.picker.html'),
    props: ['goods', 'affirmFn', 'showIt', 'hideFn', 'closeFn', "stocks"]
})

export class NumberPicker extends Vue {
    num = 1;
    isShow = false;
    showIt = false;
    total = 0;
    priceShow = false;
    nextStepShow = false;
    data() {
        return {
            isShow: this.showIt
        };
    }

    mounted() {
        this.total = 0;
        this.priceShow = false;
    }

    @Watch('showIt')
    watchShowIt(newVal, oldVal) {
        setTimeout(() => {
            this.isShow = newVal
        }, 100)
        if (newVal) {
            document.body.style.overflow = 'hidden'
        }
    }

    cancel() {
        //can't send data 2 parentNode
        //so try callback use parent's fucntion
        if (this.$props.hideFn) {
            this.$props.hideFn();
        }
    }

    nextStep() {
        let isNum = ('' + this.num).indexOf('.');
        if (!this.num || this.num <= 0 || isNum == 1) {
            this.num = 1;
            let _toast = this.$store.state.$toast;
            _toast({ title: '输入数量不正确', success: false });
            this.total = 0;
            this.priceShow = false;
            return;
        }
        if (this.$props.goods.userMaxBuyNum == 0) {
            let _toast = this.$store.state.$toast;
            _toast({ title: '该商品不能购买!', success: false });
            this.num = 1;
            this.total = 0;
            this.priceShow = false;
            this.isShow = false;
            this.$props.closeFn();
            return;
        }
        if (this.$props.affirmFn) {
            this.$props.affirmFn(this.num);
        }
        this.cancel();
        this.num = 1;
        this.total = 0;
        this.priceShow = false;
    }

    decrease() {
        if (this.num > 1) {
            this.priceShow = true;
            this.num--;
            this.total = this.$props.goods.moneyPrice * this.num;
            this.getCount();
            return;
        }
        this.num = 1;
        this.priceShow = false;
    }
    onNum() {
        this.getCount();
    }
    increase() {
        this.num++;
        this.getCount();
    }
    getCount() {
        let _self = this;
        this.priceShow = true;
        this.total = this.$props.goods.moneyPrice * this.num;
        let errmsg = "";
        let _stock = this.$props.stocks;
        if (this.num <= _stock.stock) {
            this.nextStepShow = false;
            if (Number(this.num || 0) + _stock.userBuyNum > _stock.userLimite) {
                this.nextStepShow = true;
                if (_stock.userBuyNum > 0) {
                    errmsg = "选择数量已超出用户购买上限（您已购买" + _stock.userBuyNum + "件）";
                } else {
                    errmsg = "超出用户购买上限";
                }
                let dialogObj = {
                    title: '提示',
                    content: errmsg,
                    assistBtn: '',
                    mainBtn: '知道了',
                    type: 'info',
                    assistFn() {
                    },
                    mainFn() {
                    }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
            else {
                this.nextStepShow = false;
            }
        } else {
            this.nextStepShow = true;
        }

    }
    onClose() {
        this.num = 1;
        this.priceShow = false;
        this.total = 0;
        this.isShow = false;
        this.nextStepShow = false;
        this.$props.closeFn();
    }
}

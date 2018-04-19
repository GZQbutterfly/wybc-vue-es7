import { Component, Prop, Watch } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { merge } from 'lodash';



import './money.picker.scss';


@Component({
    template: require('./money.picker.html')
})
export class MoneyPicker extends BaseVue {
    @Prop()
    goods;

    @Prop({ type: Function, default: () => { } })
    closeFn;

    @Prop({ type: Function, default: () => { } })
    affirmFn;

    num = 1;
    innum = 1;


    @Prop({ type: Number, default: 0 })
    amountGold;

    goldnum = 200; // test

    goldFlag = true;

    stockNum = 100; // test

    mounted() {

    }

    maxToast = false;

    @Watch('innum')
    watchNum(newVal, oldVal) {
        if (newVal == oldVal) {
            return;
        }
        if (!newVal) {
            newVal = 1;
        }
        let _value = (+newVal);
        if (isNaN(_value)) {
            this.innum = oldVal;
            return;
        }

        if (!this.checkNum()) {
            this.maxToast = true;
            return;
        } else {
            this.innum = _value;
            this.num = _value;


        }

        // 金币校验
        this.goldFlag = this.checkGold();
        
        if (this.maxToast) {
            this.maxToast = false;
            return;
        }

        if (!this.checkStockNum()) {
            this._$toast({ title: '库存不足', success: false });
        }
    }

    // 检查最大数量
    checkNum() {
        let _maxNum = this.goods.userMaxBuyNum;
        if (_maxNum && this.innum > _maxNum) {
            this.innum = _maxNum;
            this._$toast({ title: '一次最多购买' + _maxNum + '件', success: false });
            return false;
        }
        return true;
    }

    // 检查金币数量
    checkGold() {
        return (this.amountGold >= this.goods.goldPrice * this.num);
    }

    // 检查库存数量
    checkStockNum() {
        return (this.goods.amount >= this.num);
    }

    minus() {
        if (this.num == 1) {
            return;
        }
        this.num--;
        this.innum--;
    }

    plus() {
        this.num++;
        this.innum++;
    }

    async nextStep() {
        console.log('goods ', this.goods);
        if (this.goods.userMaxBuyNum == 0) {
            this._$toast({ title: '该商品不能购买!', success: false });
            this.num = 1;
            this.closeFn();
            return;
        }
        // 检查库存
        if (!this.checkStockNum()) {
            this.alterDialog({
                content: '当前商品库存不足，不可购买',
                assistBtn: '',
                mainBtn: '确认',
            });
            return;
        }
        let flag = true;
        // 检查金币
        if (!this.checkGold()) {
            flag = await this.alterDialog();
        }
        if (flag) {
            this.affirmFn(this.num);
            this.closeFn();
            this.num = 1;
        }

    }

    alterDialog(opts) {
        return new Promise((reslove) => {
            this._$dialog({
                dialogObj: merge({
                    title: '提示',
                    type: 'info',
                    content: '您的金币不足，超出部分将以原价购买',
                    assistBtn: '取消',
                    mainBtn: '继续购买',
                    assistFn() {
                        reslove(false);
                    },
                    mainFn() {
                        reslove(true);
                    }
                }, opts)
            });
        });
    }

}
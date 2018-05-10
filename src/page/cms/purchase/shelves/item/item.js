import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { findIndex } from 'lodash';

import './item.scss';
@Component({
    template: require('./item.html')
})
export class ShelvesItem extends Vue {
    @Prop({ type: Object })
    opts;

    @Prop({ type: Object, default: () => { return {} } })
    carmap;

    addImg = require('../../../../../static/images/shop-4.6/jiahao.png');
    noAddImg = require('../../../../../static/images/shop-4.6/jiahao2.png');

    mounted() {
        this._toast = this.$store.state.$toast;
    }

    inCar(item) {
        // let _map = this.carmap[item.goodsId];
        // if (_map && (_map.number >= item.amount)) {
        //     //该商品进货单数量已超出库存上限，不能加入！, width: 290
        //     this._toast({ success: false, title: '库存达到上限！' });
        //     return;
        // }
        this.$emit('inCar', item, () => {
            let _index = findIndex(this.opts.list, { goodsId: item.goodsId });
            if(_index > -1){
                this.opts.list.splice(_index, 1);
            }
        });
    }

    toDetail(item) {
        this.$emit('toDetail', item);
    }

    isAdd(item) {
        // let _map = this.carmap[item.goodsId];
        // if (_map) {
        //     return  item.amount > _map.number;
        // }
        return item.amount > 0;
    }
}
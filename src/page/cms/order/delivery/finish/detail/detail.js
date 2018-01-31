// 已完成配送订单详情
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { timeout } from 'common.env';



import './detail.scss';
@Component({
    template: require('./detail.html')
})
export class Detail extends BaseVue {


    data = { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场' };

    takeImgSrc = require('../../../../../../static/images/delivery/q.png');

    giveImgSrc = require('../../../../../../static/images/delivery/s.png');

    pointImgSrc = require('../../../../../../static/images/delivery/jiantou.png');

    orderDetailImgSrc = require('../../../../../../static/images/delivery/xiangqing.png');

    orderInfoImgSrc = require('../../../../../../static/images/delivery/bianhao.png');

    stepsOption = {
        steps: [
            { label: '已接单' },
            { label: '已取货' },
            { label: '成功送达' }
        ],
        stepIndex: 1,
        len: 2
    };

    goodsList= [
        {goodsName: 'asdasd1231231231123123sdasdasdsa', number: 10, price: 123},
        {goodsName: 'asdasd', number: 10, price: 123},
        {goodsName: 'asdasd', number: 10, price: 123},
        {goodsName: 'asdasd', number: 10, price: 123},
        {goodsName: 'asdasd', number: 10, price: 123},
    ];

    orderStatus = 'received'; // canceled  

    mounted() {

    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            done(true);
        }, 500);
    }

    infinite(done) {
        let _self = this;
        done(true);
    }

}
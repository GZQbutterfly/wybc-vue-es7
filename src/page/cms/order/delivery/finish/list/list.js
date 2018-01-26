import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { timeout } from 'common.env';

import { Card } from '../card/card';


import './list.scss';
@Component({
    template: require('./list.html'),
    components: {
        'card-box': Card
    }
})
export class List extends BaseVue {

    list = [
        {
            time: '1月24号',
            today: true,
            data: [
                { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场', state: 0 },
                { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场', state: 1 }
            ]
        },
        {
            time: '1月7号',
            today: false,
            data: [
                { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场', state: 0 },
                { money: 200, from: '北京', fromAddress: '北京天安门', to: '成都', toAddress: '成都天府广场', state: 1 }
            ]
        }

    ];


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
        setTimeout(() => {
            done(true);
        }, 300);
    }

}
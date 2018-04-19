// 抢单 tab

import { Component, Vue, Prop } from 'vue-property-decorator';

import { find } from 'lodash';

import {timeout} from 'common.env';
import { Card } from '../../card/card';
import Swiper from 'swiper';

import service from '../../delivery.service';

import './rob.scss';
@Component({
    template: require('./rob.html'),
    components: {
        'card-box': Card
    }
})
export class Rob extends Vue {

    list = [];

    authShow = false;
    authFirst = false;

    page = 0;
    limit = 10;

    arrs = [
        {
            "deliveryState": 4,			//单子状态 
            "combinOrderNo": 1564654879,  	//订单号
            "getAddress": "食堂门口",		//取货地点
            "getAdressDetail": "",			//取货详细地址
            "deliveryAddress": "",			//配送地址
            "deliveryMoney": 200 		//本单收入
        },
        {
            "deliveryState": 4,			//单子状态 
            "combinOrderNo": 1564654879,  	//订单号
            "getAddress": "食堂门口",		//取货地点
            "getAdressDetail": "",			//取货详细地址
            "deliveryAddress": "",		//配送地址
            "deliveryMoney": 200 		//本单收入
        }
    ];

    _$service;
    mounted() {
        this._$service = service(this.$store);

        this.$nextTick(() => {
            this.initPage();
        });

    }

    initPage() {


    }

    queryList() {
        this.page = 0;
        return this.queryNext();
    }

    async queryNext() {
        this.page++;
        let _result = (await this._$service.queryRobOrderList({ page: this.page, limit: this.limit })).data;
        if (!_result || _result.errorCode || !_result.data) {
            return [];
        } else {
            return _result.data;
        }
    }

    setList(datas, flag) {

        //datas.push(...this.arrs); // test

        if (flag) {
            this.list.push(...datas);
        } else {
            this.list = datas;
        }
    }

    // 下拉刷新
    refresh(done = (() => { })) {
        let _self = this;
        let _result = _self.queryList();

        setTimeout(() => {
            _result.then((datas) => {
                _self.setList(datas);
                done(true);
            });
        }, 500);

    }

    // 下拉加载 
    infinite(done) {
        let _self = this;
        let _result = _self.queryNext();

        setTimeout(() => {
            _result.then((datas) => {
                _self.setList(datas, true);
                done(true);
            });
        }, 500);

    }

    alertAuth() {
        this.authFirst = true;
        this.authShow = !this.authShow;
    }

    async receiveOrder(item) {
        // 1. 实名 check
        let _authFlag = false;
        let _result = await this._$service.queryRealName({});

        _result.authtype = 'sfz';

        _authFlag = _result.state != 4;

        if (_result.state == 4) {
            // 2, 配送员 check
            _result = await this._$service.queryAuthResult({});
            _result.authtype = 'psy';
            _authFlag = _result.checkState != 2;
        }

        let data = {
            auth: _authFlag,
            authData: _result,
            order: {
                success: false
            }
        };

        // _result.checkState = 2; //test
        if (_result.checkState == 2) {
            // 接单
            let loadding = this.$store.state.$loadding();
            _result = (await this._$service.receivedOrderResult({ combinOrderNo: item.combinOrderNo })).data;
            if (_result && _result.success) {
                // true
                data.order.success = true;
            }
            // this.refresh();
            timeout(() => {
                this.refresh();
                loadding.close();
            }, 700);
        }

        // 触发父组件事件
        this.$emit('operation', 'rob', data);
        console.log('接单', item);
    }

    getList() {
        return this.list;
    }

}
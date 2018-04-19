// 待取货 tab

import { Component, Vue } from 'vue-property-decorator';
import { find } from 'lodash';


import { timeout } from 'common.env';


import { Card } from '../../card/card';

import service from '../../delivery.service';

import './pickup.scss';
@Component({
    template: require('./pickup.html'),
    components: {
        'card-box': Card
    }
})
export class Pickup extends Vue {
    list = [];

    page = 0;
    limit = 10;

    arrs = [
        {
            "deliveryState": 4,			//单子状态 
            "combinOrderNo": 1564654879,  	//订单号
            "getAddress": "食堂门口",		//取货地点
            "getAddressDetail": "",			//取货详细地址
            "deliveryAddress": "",			//配送地址
            "deliveryMoney": 200 		//本单收入
        },
        {
            "deliveryState": 4,			//单子状态 
            "combinOrderNo": 1564654879,  	//订单号
            "getAddress": "食堂门口",		//取货地点
            "getAddressDetail": "",			//取货详细地址
            "deliveryAddress": "",		//配送地址
            "deliveryMoney": 200 		//本单收入
        }
    ];

    phonenumber = '';
    mapPhone = {};

    _$service;
    _$callRef;
    _dialog;
    mounted() {
        this._$service = service(this.$store);
        this._dialog = this.$store.state.$dialog;
        this.$nextTick(() => {
            this._$callRef = this.$refs.callRef;
        });
    }

    queryList() {
        this.page = 0;
        return this.queryNext();
    }

    async queryNext() {
        this.page++;
        let _result = (await this._$service.queryPickupOrderList({ page: this.page, limit: this.limit })).data;
        if (!_result || _result.errorCode || !_result.data) {
            return [];
        } else {
            return _result.data;
        }
    }

    setList(datas, flag) {

        //datas.push(...this.arrs); //test

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
    // 联系商家
    async callBusiness(item) {
        let combinOrderNo = item.combinOrderNo;
        this.phonenumber = item.__phone || this.mapPhone[combinOrderNo];
        if (!this.phonenumber) {
            let _result = (await this._$service.queryMerchantsPhone({ combinOrderNo })).data;
            if (_result && !_result.errorCode) {
                this.phonenumber = _result.sortedPhone;
            }
        }

        //this.phonenumber = '2333333'; // test
        if (this.phonenumber) {
            item.__phone = this.phonenumber;
            this.mapPhone[combinOrderNo] = this.phonenumber;
            timeout(() => {
                this._$callRef.click();
            }, 10);
        } else {
            this.phonenumber = '';
            this.alertDialog({
                title: '提示',
                type: 'info',
                content: '订单仓库分拣中，即将为你分配仓库配送员送货至你手中...',
                mainBtn: '知道啦',
                mainFn() { }
            });
        }
    }
    // 已取货
    async takenGoods(item) {

        if (item.deliveryState == 5) {
            // 分拣中， 不可点击
            return;
        }

        let _flag = await this.confirmDialog();
        if (!_flag) {
            return;
        }

        console.log('已取货', item);
        let loadding = this.$store.state.$loadding();
        let _result = (await this._$service.updatedDeliverOrderState({ combinOrderNo: item.combinOrderNo })).data;
        if (!_result || _result.errorCode) {
            this.alertDialog({
                title: '提示',
                type: 'error',
                content: '抱歉！系统服务出错, 请稍后再试。',
                mainBtn: '知道啦',
                mainFn() { }
            });
        } else {
            //this.refresh();
        }
        timeout(() => {
            this.refresh();
            this.$emit('operation', 'pickup', {});
            loadding.close();
        }, 1200);
    }

    confirmDialog() {
        let _self = this;
        return new Promise((reslove) => {
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: '是否确认取货？',
                assistBtn: '取消',
                mainBtn: '确认',
                assistFn() {
                    reslove(false);
                },
                mainFn() {
                    reslove(true);
                }
            })

        });
    }

    alertDialog(dialogObj) {
        this._dialog({ dialogObj });
    }

}
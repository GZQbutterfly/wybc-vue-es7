// 配送中tab

import { Component, Vue } from 'vue-property-decorator';
import { find, get } from 'lodash';

import { timeout } from 'common.env';


import { Card } from '../../card/card';

import service from '../../delivery.service';

import './delivering.scss';
@Component({
    template: require('./delivering.html'),
    components: {
        'card-box': Card
    }
})
export class Delivering extends Vue {
    list = [];

    page = 0;
    limit = 10;

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
        let _result = (await this._$service.queryDeliveringOrderList({ page: this.page, limit: this.limit })).data;
        if (!_result || _result.errorCode || !_result.data) {
            return [];
        } else {
            return _result.data;
        }
    }

    setList(datas, flag) {

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

    // 联系买家
    async callUser(item) {
        let _self = this;
        let combinOrderNo = item.combinOrderNo;
        _self.phonenumber = item.userPhone || this.mapPhone[combinOrderNo];

        if (!_self.phonenumber) {
            let _result = (await _self._$service.queryBuyerPhone({ combinOrderNo })).data;
            if (_result && !_result.errorCode) {
                _self.phonenumber = get(_result, 'contact.userPhone');
            }
        }

        //_self.phonenumber = '2333333'; // test
        if (_self.phonenumber) {
            this.mapPhone[combinOrderNo] = _self.phonenumber;
            item.__phone = _self.phonenumber;
            timeout(() => {
                _self._$callRef.click();
            }, 10);
        } else {
            _self.phonenumber = '';
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: '无法联系买家！',
                assistBtn: '',
                mainBtn: '知道啦',
                mainFn() {
                }
            });
        }
    }

    // 确认到达
    async confirmArrive(item) {

        let _flag = await this.confirmDialog();
        if (!_flag) {
            return;
        }

        console.log('确认到达', item);
        let loadding = this.$store.state.$loadding();
        let _result = (await this._$service.confirmationOfDelivery({ combinOrderNo: item.combinOrderNo })).data;
        if (!_result || _result.errorCode) {
            this.alertDialog({
                title: '提示',
                type: 'error',
                content: '抱歉！系统服务出错, 请稍后再试。',
                mainBtn: '知道啦',
                mainFn() { }
            });
        } else {
            // this.refresh();
        }

        this.refresh(()=>{
            loadding.close();
        });
    }

    confirmDialog() {
        let _self = this;
        return new Promise((reslove) => {
            _self.alertDialog({
                title: '提示',
                type: 'info',
                content: '是否确认送达？',
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
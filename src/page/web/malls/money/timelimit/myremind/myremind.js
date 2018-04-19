/**
 * 我的提醒， 
 * 
 * 限时秒杀页面模块说明：
 * 1.时段分场（已结束、已关闭）的提醒商品自动删除
 * 2.时段分场点击取消提醒的商品直接删除（刷新提醒商品）
 * （取消提醒时弹窗提示：是否确认取消XXXXXXXX（商品名）商品提醒？ 确认/取消）
 * （取消提醒后，按钮变为提醒我，用户可在此次点击关注此商品）
 * （取消提醒后，再次进入页面，取消提醒的商品不会在显示）
 * 2.其他的提醒商品按时段分类先后排列
 * 3.下拉刷新时，全部刷新
 * 4.进行中的时段分场，显示立即抢购/已抢光；即将开启的时段分场：显示取消提醒
 * （进行中的时段分场，没有取消提醒的功能）
 */
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { findIndex } from 'lodash';

import service from '../timelimit.service';

import './myremind.scss';
@Component({
    template: require('./myremind.html'),

})
export class MoneyTimeLimitRemind extends BaseVue {

    list = [];

    _$service;
    mounted() {
        // document.title = '我的提醒';
        this._$service = service(this.$store);
        document.title = '我的提醒';
        this.$nextTick(() => {

            this.initPage();
        });
    }

    activated() {
        // document.title = '我的提醒';
        // this.$nextTick(() => {

        //     this.initPage();
        // });
    }

    initPage() {
        let _result = this.queryList();
        _result.then((datas) => {
            this.setList(datas);
        });
    }

    count = 0;
    async queryList() {
        let _result = (await this._$service.queryUserRemindList()).data;
        if (!_result || _result.errorCode || !_result.data) {
            return [];
        }
        return _result.data;
    }

    setList(datas = []) {
        let _newList = [];
        let _time = '';
        let _map = {};

        datas.sort((a, b) => (a.periodDay + a.periodStart).replace(/\D/g, '') - (b.periodDay + b.periodStart).replace(/\D/g, ''));

        for (let i = 0, len = datas.length; i < len; i++) {
            let _item = datas[i];
            _item.hour = _item.periodStart.substr(0, 2);
            _item.action = _item.state == 6; //5:未开始  6:进行中
            _item.time = _item.periodStart.substr(0, 5);
            _item.timeEnd = _item.periodEnd.substr(0, 5);
            let _goordsList = _item.goodsList;
            for (let g = 0, glen = _goordsList.length; g < glen; g++) {
                let _goods = _goordsList[g];
                if (!_item.action) {
                    _goods.leftStock = _goods.limitedStock;
                    let saleStock = _goods.limitedStock - _goods.leftStock;
                    _goods._rate = Math.round((saleStock / _goods.limitedStock) * 100) + '%';
                }
                _goods.number  = _goods.leftStock < 0 ? 0 : _goods.leftStock;
                // if (action) {
                //     // 进行中
                //     _item.limitedStock = limitedStocks[i] || 0;
                //     _item.leftStock = leftStocks[i] || 0;
                //     _item.saleStock = saleStocks[i] || 0;
                //     //百分比 = saleStock / (saleStock + leftStock)
                //     let _total  = (+_item.saleStock + _item.leftStock) || 1;
                //     _item._rate = Math.round((_item.saleStock / _total) * 100) + '%';
                // } else {
                //     // 非进行中
                //     _item.leftStock = _item.limitedStock;
                // }
                // _item.number = _item.leftStock < 0 ? 0 : _item.leftStock;
                _goods.remindState = 1; // 默认设置为提醒中
            }
        }
        this.list = datas;
    }

    refresh(done) {
        let _result = this.queryList();
        setTimeout(() => {
            _result.then((datas) => {
                this.setList(datas);
                done(true);
            });
        }, 500);
    }

    toGoodsDetail(goods, record) {
        this.$router.push({ path: 'money_timelimit_detail', query: { goodsId: goods.goodsId, periodId: goods.periodId } })
    }

    setting = false;
    setRemind(goods, record, flag) {
        this.setting = true;
        let param = {
            periodId: goods.periodId,
            goodsId: goods.goodsId
        };
        if (flag) {
            this.comfrimCancelRemind(goods).then((flag) => {
                if (flag) {
                    this._$service.cancelLimitedRemind(param).then((res) => {
                        let _result = res.data;
                        if (!_result || _result.errorCode) {
                            this._$toast({
                                success: false,
                                title: '取消失败！'
                            });
                        } else {
                            goods.remindState = 0;
                            this.$store.commit('showSetRemindToast', { title: '提示', content: '您已取消该商品提醒！' });
                        }
                        this.setting = false;
                    });
                }
            });
        } else {
            this._$service.setLimitedRemind(param).then((res) => {
                let _result = res.data;
                if (!_result || _result.errorCode) {
                    this._$toast({
                        success: false,
                        title: '设置失败！'
                    });
                } else {
                    goods.remindState = 1;
                    this.$store.commit('showSetRemindToast', { minute: _result.remindTime || 5 });
                }
                this.setting = false;
            });
        }
    }

    comfrimCancelRemind(goods) {
        return new Promise((reslove) => {
            this._$dialog({
                dialogObj: {
                    title: '提示',
                    type: 'info',
                    content: `是否确认取消‘${goods.goodsName}’商品提醒？`,
                    assistBtn: '取消',
                    mainBtn: '确认',
                    assistFn() {
                        reslove(false);
                    },
                    mainFn() {
                        reslove(true);
                    }
                }
            });
        });

    }


}
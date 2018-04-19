import { Component, Vue, Prop } from 'vue-property-decorator';

import { find, debounce } from 'lodash';

import { timeout, getCountDown, interval, isNotLogin, toLogin } from 'common.env';

import service from '../../timelimit.service';

// ==>
import './item.scss';
@Component({
    template: require('./item.html')
})
export class TimeLimitItem extends Vue {
    @Prop({ type: Object, default: () => { return {} } })
    record;

    page = 0;

    limit = 10000;

    list = [];


    countDate = {
        hour: '00',
        minute: '00',
        second: '00'
    };

    dayTime = 86400000;

    overTime = 0;

    queryResult = null;

    _$service;

    mounted() {
        this._$service = service(this.$store);

        this._wdResult =  this.$store.dispatch('CHECK_WD_INFO') ;

        this.$nextTick(() => {
            this.initPage();
        });
    }


    initPage() {

    }


    queryList() {
        this.page = 0;
        this.limit = 10;
        this.count = 0;
        return this.queryNext();
    }

    async queryNext() {
        this.page++;
        this._wdinfo = await this._wdResult;
        let param = {
            campusId: this._wdinfo.campusId,
            periodId: this.record.periodId,
            page: this.page,
            limit: this.limit
        }
        let _result = (await this._$service.queryTimelimitListForBody(param)).data //
        this.queryResult = _result;
        if (!_result || _result.errorCode || !_result.goodsList) {
            this.$emit('operation', _result);
            return { goodsList: [] };
        }
        this.overTime = _result.leftTimeStamp;
        this.countDown();
        return _result;
    }

    setList(result = { goodsList: [] }, flag, done = () => { }) {
        let action = this.record.action;
        let datas = result.goodsList;
        let len = len = datas.length;
        let limitedStocks = result.limitedStock || [];
        let leftStocks = result.leftStock || [];
        let saleStocks = result.saleStock || [];
        let _newDats = [];
        for (let i = 0; i < len; i++) {
            let _item = datas[i];
            if (action) {
                // 进行中
                _item.limitedStock = +(limitedStocks[i] || 0);
                _item.leftStock = +(leftStocks[i] || 0);
                _item.saleStock = +(saleStocks[i] || 0);
                //百分比 = saleStock / (saleStock + leftStock)
                let _total  = (+_item.saleStock + _item.leftStock) || 1;
                _item._rate = Math.round((_item.saleStock / _total) * 100) + '%';
            } else {
                // 非进行中
                _item.leftStock = _item.limitedStock;
            }
            _item.number = _item.leftStock < 0 ? 0 : _item.leftStock;
            let _findItem = find(this.list, { goodsId: _item.goodsId });
            if (!_findItem) {
                _newDats.push(_item);
            }
        }
        if (flag) {
            this.list.push(..._newDats);
        } else {
            _newDats = datas;
            this.list = _newDats;
        }
        if (_newDats.length < this.limit) {
            this.page--;
            done(true);
        } else {
            done(false);
        }
    }

    refresh(done) {
        let _result = this.queryList();
        timeout(() => {
            _result.then((datas) => {
                this.setList(datas, false, done);
            });
        }, 500);
    }

    infinite(done) {
        let _result = this.queryNext();
        timeout(() => {
            _result.then((datas) => {
                this.setList(datas, true, done);
            })
        }, 500);
    }

    toGoodsDetail(goods) {
        // 传入时段信息，区分商品详情时段 数据
        this.$router.push({ path: 'money_timelimit_detail', query: { goodsId: goods.goodsId, periodId: this.record.periodId } })
    }

    setting = false;
    setRemind(goods, flag) {
        let notloginFlag = isNotLogin();
        // debugger;
        if (notloginFlag) {
            //未登录
            toLogin(this.$router, { toPath: 'money_timelimit_list' });
            return;
        }
        if (this.setting) {
            return;
        }
        this.setting = true;
        let param = {
            periodId: this.record.periodId,
            goodsId: goods.goodsId
        };
        if (flag) {
            goods.remindState = 0;
            this._$service.cancelLimitedRemind(param).then((res) => {
                let _result = res.data;
                if (!_result || _result.errorCode) {
                    this.$store.state.$toast({
                        success: false,
                        title: '取消失败！'
                    });
                } else {
                    this.$store.commit('showSetRemindToast', { title: '提示', content: '您已取消该商品提醒！' });
                }
                this.setting = false;
            });
        } else {
            goods.remindState = 1;
            this._$service.setLimitedRemind(param).then((res) => {
                let _result = res.data;
                if (!_result || _result.errorCode) {
                    this.$store.state.$toast({
                        success: false,
                        title: '设置失败！'
                    });
                } else {
                    this.$store.commit('showSetRemindToast', { minute: _result.remindTime || 5 });
                }
                this.setting = false;
            });
        }
    }

    // 定时器 时间到时 重新加载数据
    reInit() {
        timeout(() => {
            this.refresh(() => {
                let _result = this.queryResult;
                if (!_result || _result.errorCode) {
                    this.$emit('operation', _result);
                    return [];
                }
                this.$emit('operation');
            });
        }, 1000);
    }

    countDown() {
        let _self = this;
        if (isNaN(+_self.overTime) || _self.overTime < 999 || _self.dayTime < _self.overTime) {
            return;
        }
        _self.overFlag = true;
        _self.diffHour();
        window.clearInterval(_self.timer);
        _self.timer = interval(() => {
            _self.overTime -= 1000;
            if (_self.overTime <= 500) {
                _self.overFlag = false;
                _self.countDate = { hour: '00', minute: '00', second: '00', day: '00' };
                window.clearInterval(_self.timer);
                // 倒计时结束， 重新请求 并刷新限时活动数据
                _self.reInit();
            } else {
                _self.diffHour();
            }
        }, 1000);
    }

    diffHour() {
        let _result = getCountDown(this.overTime, 'h');
        this.countDate = { hour: _result.h, minute: _result.m, second: _result.s };
    }

    destroyed() {
        window.clearInterval(this.timer);
    }

    // stopTimer = false;
    // deactivated() {
    //     // keep-alive  非活动时 清除 定时器
    //     // this.stopTimer = true;
    //     // window.clearInterval(this.timer);
    // }

    // activated() {
    //     // 活动模块激活定时器
    //     if (this.stopTimer) {
    //         // this.stopTimer = false;
    //         // this.countDown();
    //     }
    // }

}

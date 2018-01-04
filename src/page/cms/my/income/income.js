// 我的收益
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';

import { merge } from 'lodash';

import service from './income.service';

import './income.scss';
@Component({
    template: require('./income.html')
})
export class MyIncome extends BaseVue {
    dataList = [];
    totalMoney = 0;
    todayMoney = 0;
    queryPage = 0;
    queryLimit = 10;
    queryFlag = true;
    _$service;

    mounted() {
        // 注册服务
        this._$service = service(this.$store);
        // DOM加载完成
        this.$nextTick(() => {
            document.title = "我的收益";
        });
    }

    /**
     * 初始化
     */
    queryIncomeDataInit(cb) {
        // this.dataList = [];
        this.queryPage = 0;
        this.queryFlag = true;
        this.queryIncomeDataNext(cb);
    }

    /**
     * 下一页
     */
    queryIncomeDataNext(cb) {
        let _self = this;
        _self.queryPage++;
        let data = {
            page: _self.queryPage,
            limit: _self.queryLimit,
            shopId: _self.$store.state.workVO.user.userId,
        }
        _self._$service.queryIncomeList(data).then((res) => {
            res = res.data;
            if (res == '' && !this.queryFlag || res.data.errorCode) {
                _self.queryFlag = false;
            } else {
                let len = res.data.length;
                if (_self.queryPage == 1) {
                    _self.totalMoney = res.totalMoney;
                    _self.todayMoney = res.todayMoney;
                }
                if (res.data.length < _self.queryLimit) {
                    _self.queryFlag = false;
                }
                if (len) {
                    _self.queryPage == 1 && (_self.dataList = []);
                    for (var i = 0; i < len; i++) {
                        let title = res.data[i].title;
                        //是否为订单
                        res.data[i].isOrder = (title.indexOf('订单') != -1);
                        //订单号 -- 以后可能点击跳订单详情
                        // let reg_numb = /(\d+)/;
                        // res.data[i].orderNo = reg_numb.test(title) ? reg_numb.exec(title)[0] : '';
                        //是否为用户订单
                        res.data[i].isUserOrder = res.data[i].isOrder && res.data[i].incomeInfo == '用户订单';
                        //处理份数
                        let reg_show = /\((\d+).?\)$/;
                        if (reg_show.test(res.data[i].descri)) {
                            let arr = reg_show.exec(res.data[i].descri);
                            let txt = '<span class="shop-num">' + arr[1] + '</span>';
                            let tmp = arr[0].replace(arr[1], txt);
                            res.data[i].descri = res.data[i].descri.replace(arr[0], tmp);
                        }
                        //push
                        _self.dataList.push(res.data[i]);
                    }
                }

            }
            cb && cb();
        });
    }

    //刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.queryIncomeDataInit(done(true));
        }, 500)
    }

    //加载
    infinite(done) {
        let _self = this;
        if (this.queryFlag) {
            setTimeout(() => {
                _self.queryIncomeDataNext(done(true));
            }, 500)
        } else {
            done(true);
        }
    }
}

import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import { merge } from 'lodash';
import service from './income.service';
import './income.scss';

@Component({
    template: require('./income.html')
})

export class MyIncome extends BaseVue {
    totalMoney = 0;
    todayMoney = 0;

    queryFlag = true;

    isRefreshing = false;
    _$service;

    dataList = [
        {
            id: 0,
            value: '订单收益',
            page: 1,
            data: [],
        },{
            id: 1,
            value: '配送收益',
            page: 1,
            data: [],
        },{
            id: 2,
            value: '客服操作',
            page: 1,
            data: [],
        },
    ];
    dataList_limit = 10;
    showItemId = this.dataList[0].id;

    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            document.title = "我的收益";
        });
    }

    //点击切换类别
    changeView(id){
        let _self = this;
        _self.showItemId = id;
    }

    //加载当前id下的资讯
    loadView() {
        let _self = this;
        let _item = _self.dataList[_self.showItemId];
        let query = {
            page: _item.page,
            limit: _self.dataList_limit,
            shopId: _self.$store.state.workVO.user.userId,
        };
        return _self._$service.queryIncomeList(query);
    }

    //处理上拉下拉得到的数据
    setViewData(res,done,isRefresh){
        let _self = this;
        let _item = _self.dataList[_self.showItemId];
        if (res.data.errorCode) {
            if (isRefresh) {
                _item.data = [];
            }
        } else {
            _self.totalMoney = res.totalMoney;
            _self.todayMoney = res.todayMoney;
            let len = res.data.length;
            if (len) {
                _self.queryPage == 1 && (_self.dataList = []);
                for (var i = 0; i < len; i++) {
                    let title = res.data[i].title;
                    res.data[i].isOrder = (title.indexOf('订单') != -1);
                    let reg_numb = /(\d+)/;
                    res.data[i].orderNo = reg_numb.test(title) ? reg_numb.exec(title)[0] : '';
                    res.data[i].isUserOrder = res.data[i].isOrder && res.data[i].incomeInfo == '用户订单';
                    let reg_show = /\((\d+).?\)$/;
                    if (reg_show.test(res.data[i].descri)) {
                        let arr = reg_show.exec(res.data[i].descri);
                        let txt = '<span class="shop-num">' + arr[1] + '</span>';
                        let tmp = arr[0].replace(arr[1], txt);
                        res.data[i].descri = res.data[i].descri.replace(arr[0], tmp);
                    }
                }
            }

            if (isRefresh) {
                _item.data = res.data.data;
            } else {
                _item.data.push(...res.data.data);
            }
            if (_item.data.length < _self.limit) {
                _item.page = -1;
            } else {
                _item.page++;
            }
        }
        done(true);
        isRefresh && (_self.isRefreshing = false);
    }

    //下拉刷新
    refresh(done) {
        let _self = this;
        if(_self.isRefreshing){
            done(true);
        }else{
            _self.isRefreshing = true;
            let _item = _self.dataList[_self.showItemId];
            _item.page = 1;
            let _listen = _self.loadView();
            setTimeout(() => {
                _listen.then((res) => {
                    _self.setViewData(res,done,true);
                })
            }, 300);
        }
    }

    //上拉加载
    infinite(done) {
        let _self = this;
        let _item = _self.dataList[_self.showItemId];
        if (_item.page == -1) {
            done(true);
            return;
        }
        let _listen = _self.loadView();
        setTimeout(() => {
            _listen.then((res) => {
                _self.setViewData(res,done,false);
            })
        }, 300)
    }
}

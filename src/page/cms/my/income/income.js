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
    todayConsume = 0;

    _$service;

    dataList_old = [
        {
            id: 0,
            optType: 1,
            value: '订单收益',
            page: 0,
            data: [],
            create: true
        },{
            id: 1,
            optType: 2,
            value: '配送收益',
            page: 0,
            data: [],
            create: false
        },{
            id: 2,
            optType: 9,
            value: '客服操作',
            page: 0,
            data: [],
            create: false
        },
    ];

    dataList = [
        {
            id: 0,
            value: '收益',
            consuType: 1, 
            page: 0,
            data: [],
            create: true
        },{
            id: 1,
            value: '消费',
            consuType: 0,
            page: 0,
            data: [],
            create: false
        }
    ];
    dataList_limit = 10;
    showItemId = 0;

    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            document.title = "收支明细";
        });
    }

    //点击切换类别
    changeView(item){
        item.create = true;
        this.showItemId = item.id;
    }

    fetchData(index, page, done){
        let _item = this.dataList[this.showItemId];
        let query = {
            // optType: _item.optType,
            // optType: 2,
            page: page,
            limit: this.dataList_limit,
            shopId: this.$store.state.workVO.user.userId,
            consuType: _item.consuType 
        };
        let _self = this;
        this._$service.queryIncomeList(query)
        .then(res=>{
            let _result = res.data;
            if (!_result || _result.errorCode) {
                done(true);
            }else{
                let _data = _result.data;
                _self.setTitleValue(_result);
                if (_data.length>0) {
                    _data.forEach(element => {
                        element.isOrder = (element.title.indexOf('订单') != -1);
                        let reg_numb = /(\d+)/;
                        element.orderNo = reg_numb.test(element.title) ? reg_numb.exec(element.title)[0] : '';
                        element.isUserOrder = element.isOrder && element.incomeInfo == '用户订单';
                        let reg_show = /\((\d+).?\)$/;
                        if (reg_show.test(element.descri)) {
                            let arr = reg_show.exec(element.descri);
                            let txt = '<span class="shop-num">' + arr[1] + '</span>';
                            let tmp = arr[0].replace(arr[1], txt);
                            element.descri = element.descri.replace(arr[0], tmp);
                        }
                    });
                    if (page == 1) {
                        _item.data = _data;
                        _item.page = 1;
                    }else{
                        _item.data.push(..._data);
                        _item.page = page;
                    }
                }
                done(true);
            }
        })
    }


    setTitleValue(_result){
        if(![undefined, null].includes(_result.totalMoney)){
            this.totalMoney = (+_result.totalMoney) || 0; // 累积收益
        }
        if(![undefined, null].includes(_result.todayMoney)){
            this.todayMoney = (+_result.todayMoney) || 0; // 今日收益
        }
        if(![undefined, null].includes(_result.todayConsume)){
            this.todayConsume = (+_result.todayConsume) || 0; // 今日支出
        }
    }


    //下拉刷新
    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.fetchData(_self.showItemId,1,done);
        }, 300);
    }

    //上拉加载
    infinite(done) {
        let _self = this;
        let _item = this.dataList[this.showItemId];
        setTimeout(() => {
            _self.fetchData(_self.showItemId,_item.page + 1,done)
        }, 300)
    }
}

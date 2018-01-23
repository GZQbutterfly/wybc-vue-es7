// 消息通知组件
import { Component, Prop, Vue } from 'vue-property-decorator';

import { timeout, isCMS } from 'common.env';
import { find } from 'lodash';



import service from './message.notice.service';
import './message.notice.scss';

// ==>
@Component({
    template: require('./message.notice.html')
})
export class MessageNotice extends Vue {
    list = [];
    page = 0;
    data() {
        return {

        };
    }
    mounted() {
        this._$service = service(this.$store);
        this._isCMS = isCMS();
        this.$nextTick(() => {
            // this.queryMessage().then((datas) => {
            //     this.setDatas(datas);
            // });
        })
    }
    queryMessage(page = this.page) {
        let _result = null;
        let _pageData = {
            page: page,
            limit: 10
        };
        // console.log('Loade pagedata: ', _pageData);
        if (this._isCMS) {
            _result = this._$service.queryCMSOrderMessage(_pageData);
        } else {
            _result = this._$service.queryOrderMessage(_pageData);
        }
        return _result.then((res) => {
            let _data = res.data;
            if (_data.errorCode) {
                _data = [];
            }
            if (!_data.length) {
                // 大于1的页数时，没有获取到数据，默认-1回到上次的页数
                this.page > 1 && (this.page--);
            }
            return _data;
        }).catch(() => {
            this.page > 1 && (this.page--);
            return [];
        });
    }
    setDatas(datas, preFlag = false) {
        let _newList = [];
        for (let i = 0, len = datas.length; i < len; i++) {
            let _data = datas[i];
            let isExist = find(this.list, { orderNo: _data.orderNo, maketime: _data.maketime });
            if (!isExist) {
                _newList.push(_data);
            }
        }
        // console.log('新的数据：', _newList);
        preFlag ? this.list.unshift(..._newList) : this.list.push(..._newList);
    }
    /**
     * 下拉刷新
     * @param done
     */
    refresh(done) {
        let _result = this.queryMessage(1);
        timeout(() => {
            _result.then((datas) => {
                this.setDatas(datas, true);
                done(true);
            })
        }, 500);
    }
    /**
     * 上拉加载
     * @param done
     */
    infinite(done) {
        this.page++;
        let _result = this.queryMessage();
        timeout(() => {
            _result.then((datas) => {
                this.setDatas(datas);
                done(true);
            })
        }, 500);
    }
    toOrderDetail(item) {
        // 去订单详情
        let _toPath = 'order_detail';
        let _serverAttr = 'updOrderMessageStatus';
        let _param = { usermsgId: item.usermsgId };
        if (this._isCMS) {
            _toPath = 'cms_out_order_detail';
            _serverAttr = 'updCMSOrderMessageStatus';
            _param = { wdmsgId: item.wdmsgId };
        }
        if (!item.state) {
            this._$service[_serverAttr](_param);
        }
        this.$router.push({ path: _toPath, query: { orderId: item.orderNo } });

    }
}

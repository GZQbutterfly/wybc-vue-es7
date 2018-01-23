
import { isNotLogin } from 'common.env';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;


    //获取用户积分
    let scoreurl = 'api/wallet/q_wallet';
    //获取用户订单列表数量
    let ordernumburl = 'api/order_whole/q_order_count';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        /**
         * 列表配置数据
         */
        getOrderListInfo() {
            return [
                {
                    'index': 1,
                    'type': '待付款',
                    'pic': 'daifukuan',
                    'num': '',
                },
                {
                    'index': 2,
                    'type': '待发货',
                    'pic': 'daifahuo',
                    'num': '',
                },
                {
                    'index':3,
                    'type': '待收货',
                    'pic': 'yifahuo',
                    'num': '',
                },
                {
                    'index':4,
                    'type': '交易完成',
                    'pic': 'jiaoyiwancheng',
                    'num': '',
                },
                {
                    'index': 0,
                    'type': '更多订单',
                    'pic': 'quanbudingdan',
                    'num': '',
                },
            ];
        },
        /**
         * 获取用户积分
         */
        // getUserScore() {
        //     return q(scoreurl)
        // },

        /**
         * 获取用户订单列表数量
         */
        getUserOrderNumb() {
            return q(ordernumburl)
        }
    }

}

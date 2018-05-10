
import { isNotLogin } from 'common.env';

export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {
        /**
         * 获取总榜数据集
         * type: 1   //榜单类型：1：总榜 2：店长榜
         * @param {*} data 
         */
        queryAllRank(data) {
            // return q('api/wd_vip/q_ranking_list', data);
            return q('api/ranking/q_ranking_data_with_now', { type: 1, ...data })
        },
        /**
         * 获取店长榜数据集
         * @param {*} data 
         */
        queryShopRank(data) {
            return q('api/ranking/q_ranking_data_with_now', { type: 2, ...data })
        },
        /**
         * 查询排行榜活动
         */
        queryRanking(data) {
            return q('api/ranking/q_ranking_state', data);
        },
        /**
         * 获取用户金币数据
         * @param {*} data 
         */
        queryGoldInfo(data) {
            return q('api/wallet/q_gold_wallet', data);
        }
    }

}

export default (store) => {
    let _state = store.state;
    let _http = _state.$http;

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        getTaskListGoods(){
            return q('api/day_task/get_share_goods_task');
        },

        getTaskListFirend(){
            return q('api/day_task/get_invite_friend_task');
        },

        getTaskGold(data){
            return q('api/day_task/get_task_gold', data);
        }
    }

};
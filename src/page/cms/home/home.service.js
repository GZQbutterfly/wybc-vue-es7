export default (_store) => {
    let _state = _store.state;
    let _http = _state.$http;

    //获取实名认证信息
    let queryrealname = 'api/q_real_name';
    //获取配送员实名认证
    let querydistributorrealname = 'api/q_real_name';
    //获取用户店铺信息
    let queryshopInfo = 'api/wd_vip/queryWdInfo';
    //获取用户钱包余额
    let queryusermoney = 'api/q_api_wallet_by_userId';
    //获取系统消息列表
    let querysystemmsg = 'api/wd_vip/q_notice_wd';
    //获取用户收益数据
    let querymyincome = 'api/q_api_income';
    //获取banner数据
    let querybannerdata = 'api/q_store_ads';

    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }

    return {

        //获取实名认证信息
        queryRealName() {
            return q(queryrealname, {});
        },
        //获取配送员认证信息
        queryDistributorRealName(){
            return q(querydistributorrealname, {});
        },
        //获取用户钱包余额
        queryUserMoney() {
            return q(queryusermoney, {});
        },
        //获取用户等级信息
        queryShopInfo() {
            let data = {
                shopId: _state.workVO.user.userId
            }
            return q(queryshopInfo, data);
        },
        //获取系统消息列表
        querySystemMsg() {
            return q(querysystemmsg, {});
        },
        queryMessageNum(){
            return q('api/wd_vip/q_wd_msgnum', {infoId: _state.workVO.user.userId});
        },
        //获取用户收益数据
        queryMyIncome() {
            let data = {
                page: 1,
                limit: 1,
                shopId: _state.workVO.user.userId
            }
            return q(querymyincome, data);
        },
        //获取banner数据
        queryBannerData() {
            let data = {
                posId: 2,
                channel: 'store'
            }
            return q(querybannerdata, data);
        },
        //九宫格列表
        queryGridsData() {
            let data = [
                {
                    href: 'cms_purchase',
                    icon: '/static/images/minishop/s1.png',
                    title: '我要进货',
                    canVisit: true,
                },
                {
                    href: 'cms_out_order',
                    icon: '/static/images/minishop/s10.png',
                    title: '出货订单',
                    canVisit: true,
                },
                {
                    href: 'my_inventory_list',
                    icon: '/static/images/minishop/s3.png',
                    title: '我的库存',
                    canVisit: true,
                },
                {
                    href: 'my_team',
                    icon: '/static/images/minishop/s8.png',
                    title: '我的团队',
                    canVisit: true,
                },
                {
                    href: 'delivery_order',
                    icon: '/static/images/minishop/ps.png',
                    title: '我的配送',
                    canVisit: true,
                },
                {
                    href: 'my_spread',
                    icon: '/static/images/minishop/s5.png',
                    title: '我要推广',
                    canVisit: true,
                },
                {
                    href:'/information',
                    icon:'/static/images/minishop/s4.png',
                    title:'资讯',
                    canVisit: true,
                },
                {
                    href: 'helper',
                    icon: '/static/images/minishop/skefu.png',
                    title: '联系客服',
                    canVisit: true,
                },
            ];
            return Promise.resolve(data);
        }
    }
};

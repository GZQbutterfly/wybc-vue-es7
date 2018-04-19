export default (store) => {
    let q = store.state.$http;

    return {

        /**
          * 请求分类 对应的 商品集
          * @param {*} data 
          */
        queryClassifyList(data) {
            return q('api/directSale/q_direct_sale_goods', data);
        }
    };

}
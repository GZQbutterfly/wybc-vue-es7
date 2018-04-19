import { Component, Vue } from 'vue-property-decorator';



import './shopcard.scss';
@Component({
    template: require('./shopcard.html')
})
export class ShopCard extends Vue {

    list = [
        {
            label: '店长直营',
            desc: '店长直送30分钟送货上门',
            labelImg: require('../../../../../../static/images/shop-4.6/dianzhangzhiying.png'),
            img: require('../../../../../../static/images/shop-4.6/k-tu.png'),
            to: 'classify'
        },
        {
            label: '店铺代理',
            desc: '官方直营，优选精品',
            labelImg: require('../../../../../../static/images/shop-4.6/dianpudaili.png'),
            img: require('../../../../../../static/images/shop-4.6/g-tu.png'),
            to: 'shop_chief'
        }
    ];

    mounted() {
        this.$nextTick(() => {

        });
    }


    go(item) {
        console.log(item);
        this.$router.push({ path: item.to });
    }

}

// 待取货 tab

import { Component, Vue } from 'vue-property-decorator';

import {Card} from '../../card/card';

import './pickup.scss';
@Component({
    template: require('./pickup.html'),
    components:{
        'card-box': Card
    }
})
export class Pickup extends Vue {
    list = [1, 3];
    mounted () {
        
    }

    refresh(done){
        let _self = this;
        setTimeout(()=>{
            _self.list = [3, 4, 5, 6];
            done(true);
        }, 500);
    }

    infinite(done){
        let _self = this;
        setTimeout(()=>{
            _self.list.push(5, 6, 7, 8, 9);
            done(true);
        }, 500);
    }
    // 联系商家
    callBusiness(item){
        console.log('联系商家', item)
    }
    // 已取货
    takenGoods(item){
        console.log('已取货', item)
    }

}
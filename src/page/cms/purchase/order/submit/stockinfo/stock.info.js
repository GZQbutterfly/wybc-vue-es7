import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';




import './stock.info.scss';
@Component({
    template: require('./stock.info.html')
})
export class StockInfo extends BaseVue {
    mounted () {
        this.$nextTick(()=>{
            document.title = '进货仓储说明';
        })
    }
}

import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import './info.scss';

@Component({
    template: require('./info.html')
})
export class Info extends BaseVue {

    infoName = '';

    mounted () {
        this.infoName = this.$route.query.infoName;
        let _self = this;
        this.$nextTick(()=>{
            document.title = '说明';
            _self.updateWxShare();
        })
    }
}

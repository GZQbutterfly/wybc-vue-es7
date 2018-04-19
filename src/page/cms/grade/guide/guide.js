import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';




import './guide.scss';
@Component({
    template: require('./guide.html')
})
export class GradeGuide extends BaseVue {
    mounted () {
        let _self = this;
        this.$nextTick(()=>{
            document.title = '店长等级说明';
            _self.updateWxShare();
        })
    }
}

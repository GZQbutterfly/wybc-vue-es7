import { Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
import './rules.scss';

@Component({
    template: require('./rules.html')
})

export class DayTaskRules  extends BaseVue {
    state = -1;
    mounted () {
        let _self = this;
        let state = _self.$route.query.state;
        state && (_self.state = state);
    }
}
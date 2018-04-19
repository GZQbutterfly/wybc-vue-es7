import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import calendar from 'components/calendar/calendar.vue';

import './guid.scss';
@Component({
    template: require('./guid.html')
})
export class DaySignGuid extends BaseVue {

}
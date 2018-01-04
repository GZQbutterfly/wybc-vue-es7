import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import {timeout}  from 'common.env';

import './circle.component.scss';

// const isColor = function (value) {
//     const colorReg = /^#([a-fA-F0-9]){3}(([a-fA-F0-9]){3})?$/;
//     const rgbaReg = /^[rR][gG][bB][aA]\(\s*((25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*){3}\s*(\.|\d+\.)?\d+\s*\)$/;
//     const rgbReg = /^[rR][gG][bB]\(\s*((25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*){2}(25[0-5]|2[0-4]\d|1?\d{1,2})\s*\)$/;
//     return colorReg.test(value) || rgbaReg.test(value) || rgbReg.test(value);
// }

@Component({
    computed: {
        getPathString() {
            if (this.type === 'line') {
                return 'M 0,{R} L 100,{R}'.replace(/\{R\}/g, this.trailWidth / 2 + '');
            } else {
                const r = 50 - (this.strokeWidth ? this.strokeWidth : this.trailWidth) / 2;
                return 'M 50,50 m 0,-{R} a {R},{R} 0 1 1 0,{2R} a {R},{R} 0 1 1 0,-{2R}'.replace(/\{R\}/g, r).replace(/\{2R\}/g, 2 * r + '');
            }
        }
    },
    template: require('./circle.component.html')
})
export class CircleComponent extends Vue {
    @Prop({ type: String, validator(value) { return ['circle', 'line'].indexOf(value) > -1; }, default: 'circle' })
    type;
    // validator(value) { if (!value) return true; return isColor(value); }
    @Prop({ type: String })
    fillColor;

    // validator(val) { return /^\d*$/.test(val); },
    @Prop({ type: [String, Number], default: 0 })
    strokeWidth

    // validator(value) { if (!value) return true; return isColor(value); },
    @Prop({ type: String, default: '#E5E5E5' })
    strokeColor;

    // validator(val) { return /^\d*$/.test(val); },
    @Prop({ type: [String, Number], default: 0, required: true })
    trailWidth;

    // validator(value) { if (!value) return true; return isColor(value); },
    @Prop({ type: String, default: '#646464' })
    trailColor

    // validator(val) { return /^(0(.\d+)?|1(\.0+)?)$/.test(val); },
    @Prop({ type: [String, Number], default: 0 })
    progress;

    data() {
        return {
            viewBox: '0 0 100 100',
            show: false,
            stroke: {
                dasharray: '',
                dashoffset: ''
            }
        }
    }

    mounted() {
        let _self = this;
        const length = _self.length = _self.$refs.trailPath.getTotalLength();
        _self.stroke.dashoffset = length;
        _self.stroke.dasharray = length + ',' + length;

        //_self.scrollview = getScrollview(_self.$el);

        _self.show = true;

        if (_self.type === 'line') {
            _self.viewBox = '0 0 100 ' + (_self.strokeWidth ? _self.strokeWidth : _self.trailWidth);
        }
        this.$nextTick(() => {
            _self.scrollHandler();
        });
        //_self.bindEvent();
    }


    scrollHandler() {
        let _self = this;
        //if (checkInview(_self.scrollview, _self.$el)) {
        //}
        timeout(() => {
            _self.stroke.dashoffset = _self.length - _self.progress * _self.length;
        });
    }

    bindEvent() {
        let _self = this;
        _self.scrollview.addEventListener('scroll', this.scrollHandler);
        window.addEventListener('resize', this.scrollHandler);
    }

    unbindEvent() {
        let _self = this;
        _self.scrollview.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.scrollHandler);
    }

    @Watch('progress')
    setProgress(val) {
        let _self = this;
        _self.stroke.dashoffset = _self.length - val * _self.length;
    }

    destroyed() {

    }
}

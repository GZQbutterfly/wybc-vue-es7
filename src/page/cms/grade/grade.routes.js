// VIP等级路由

const routes = [// ===>
    // VIP 等级
    {
        path: '/grade_layout',
        name: 'grade_layout',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./layout/layout')['Layout']);
            }, 'cms/grade/grade');
        },
        redirect: {
            name: 'grade'
        },
        children: [
            {
                path: '/grade',
                name: 'grade',
                meta: {
                    title: '店长等级'
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./grade')['Grade']);
                    }, 'cms/grade/grade');
                }
            }, {
                path: '/grade_up',
                name: 'grade_up',
                meta: {
                    title: '立刻晋级'
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./up/up')['GradeUp']);
                    }, 'cms/grade/grade');
                }
            },
            // GradeGuide
            {
                path: '/grade_guide',
                name: 'grade_guide',
                meta: {
                    title: '店长等级说明'
                },
                component: resolve => {
                    require.ensure([], require => {
                        resolve(require('./guide/guide')['GradeGuide']);
                    }, 'cms/grade/grade');
                }
            }
        ]
    }
];

export default routes;

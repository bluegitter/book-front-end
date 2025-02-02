import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import qs from 'query-string';
import hljs from 'highlight.js';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import inViewport from 'in-viewport';
import { withRouter } from 'dva/router';
import { copyButton } from '../../util/copy';

import 'highlight.js/styles/github.css'
import { getQuery, getSearch } from '../../util/query';

import styles from './index.less';

const MATCH_TAGS = ['H1', 'H2', 'H3', 'H4'];

class Body extends React.Component {
  static propTypes = {
    doc: PropTypes.shape({
      title: PropTypes.string,
      body_html: PropTypes.string,
      slug: PropTypes.oneOfType([
        PropTypes.number, PropTypes.string
      ])
    }),
    location: PropTypes.shape({
      search: PropTypes.string
    }),
    history: PropTypes.shape({
      push: PropTypes.func
    }),
    pageCount: PropTypes.number,
    slug: PropTypes.string
  }

  state = {
    toc: [],
    activeTocId: null,
    visitCount: 0
  }

  componentDidUpdate = (nextProps) => {
    if (nextProps.doc !== this.props.doc) {
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
        copyButton(block);
      });

      this.initDocToc();

      const search = _.get(this, 'props.location.search');

      if (!search) {
        this.topDOM && this.topDOM.scrollIntoView(true);
      }
    }

    const docSlug = _.get(this, 'props.slug');
    const title = _.get(this, 'props.doc.title');
    console.log(docSlug, title)
    if (docSlug && title && window._hmt) {
      // window._hmt.push(['_trackEvent', 'doc', 'view', docSlug]);
      window._hmt.push(['_trackPageview', `/docs/#/${docSlug}.html`])
    }
  }

  componentDidMount = () => {
    const search = _.get(this, 'props.location.search');

    // 锚点恢复
    if (search) {
      const query = qs.parse(search);
      const anchor = query.anchor;

      if (anchor) {
        this.setState({
          activeTocId: anchor
        });

        setTimeout(this.toView(anchor), 100);
      }
    }

    const script = document.createElement("script");
    script.src = "https://hm.baidu.com/hm.js?80b8dff5f35018a47a0524b880ab5da6";
    script.async = true;

    document.body.appendChild(script);
  }

  // 初始化右侧toc
  initDocToc = () => {
    const div = $('#yuque-book-container');

    const isaAnchor = (ele) => {
      return ele.text().trim() !== '' && MATCH_TAGS.includes(ele[0].tagName);
    }

    const hs = div.find('[id]');

    const toc = [];

    for (let ele of hs) {
      ele = $(ele);

      if (isaAnchor(ele)) {
        toc.push({
          ele,
          title: ele.text(),
          id: ele.attr('id'),
          level: Number(ele[0].tagName.replace(/H/g, '')),
        });
      }
    }

    const minLevel = _.min(toc.map(t => t.level));
    toc.forEach(t => t.depth = t.level - minLevel);

    this.setState({
      toc: toc
    }, this.onScroll);
  }

  onScroll = () => {
    const { toc } = this.state;
    for (let item of toc) {
      const ele = _.get(item, 'ele[0]');
      if (!ele) {
        continue;
      }

      if (inViewport(ele, {
        offset: -60 // 这里的 viewport 应该是 body 部分，不包含 header
      })) {
        this.setState({
          activeTocId: item.id
        });

        return;
      }
    }
  }

  toView = (id) => {
    const { location } = this.props;

    return () => {
      const query = getQuery(location.search);

      document.getElementById(id).scrollIntoView(true);
      query.anchor = id;

      getSearch(query);

      this.props.history.push({
        search: getSearch(query)
      });
    };
  }

  render() {
    const { doc } = this.props;
    if (!doc) {
      return null;
    }

    const visitCount = _.get(this, 'props.pageCount');
    const { toc, activeTocId } = this.state;
    return (
      <div
        onScroll={this.onScroll}
        className={styles.container + " lake-engine-view"}
      >
        <div ref={(dom) => this.topDOM = dom}></div>
        <div className={styles['doc-container'] + ' typo'} id="yuque-book-container">
          <h1>{doc.title}
            <span style={{ color: 'gray', fontSize: 'small' }}> 本文档已被阅读{visitCount}次数. </span>
          </h1>
          <div
            dangerouslySetInnerHTML={{ __html: doc.body_html }}
          >
          </div>
          <div className={styles['doc-wrapper']}>
            <div className={classnames(styles['doc-toc'], styles['has-width'])}>
              {
                toc.map(item => {
                  return (
                    <div
                      className={
                        classnames(
                          styles['doc-item'],
                          {
                            [styles['doc-item-active']]: activeTocId === item.id
                          }
                        )
                      }
                      title={item.title}
                      onClick={this.toView(item.id)}
                    >
                      <span className={`doc-link doc-link-${item.depth}`}>
                        {
                          item.title.trim()
                        }
                      </span>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Body);
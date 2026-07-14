import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Pointer from '../../../assets/Image/Pointer.svg';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';
import TeaStoryScroller from '../../Tea/TeaStoryScroller/TeaStoryScroller.jsx';
import { normalizeTeaContent } from '../../../utils/teaContent.js';
import { getCuratedJournalArticle } from '../../../data/journalContent.js';
import './BlogArticle.css';

const BlogArticle = () => {
  const { id } = useParams();
  const curatedArticle = useMemo(() => getCuratedJournalArticle(id), [id]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (curatedArticle) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/blogSection/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Article request failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setArticle(normalizeTeaContent(data));
        setLoading(false);
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error(error);
        setLoading(false);
      });

    return () => controller.abort();
  }, [curatedArticle, id]);

  const displayArticle = curatedArticle || article;

  const storyConfig = useMemo(() => {
    const sections = Array.isArray(displayArticle?.sections) ? displayArticle.sections : [];

    return {
      scenes: sections.map((section, index) => ({
        id: section.id ?? index,
        title: section.title,
        shortTitle: section.shortTitle || section.title,
        content: Array.isArray(section.content) ? section.content : [section.content].filter(Boolean),
        mobileContent: Array.isArray(section.shortContent)
          ? section.shortContent
          : Array.isArray(section.content)
            ? section.content
            : [section.content].filter(Boolean),
      })),
      cards: [],
    };
  }, [displayArticle]);

  if (loading && !curatedArticle) {
    return (
      <div className="BlogArticle container">
        <p>Загрузка статьи...</p>
      </div>
    );
  }

  if (!displayArticle) {
    return (
      <div className="BlogArticle container">
        <p>Статья не найдена.</p>
      </div>
    );
  }

  return (
    <div className="BlogArticle">
      <div className="container">
        <Breadcrumbs articleTitle={displayArticle.title} />
      </div>

      <div className="container">
        <div className="BlogArticle_hero">
          <img src={displayArticle.heroImage} alt={displayArticle.title} className="BlogArticle_hero_image" />
          <div className="BlogArticle_hero_overlay">
            <div className="BlogArticle_hero_content">
              <h1 className="BlogArticle_hero_title">{displayArticle.title}</h1>
              <p className="BlogArticle_hero_description">{displayArticle.description}</p>
            </div>
            <div className="BlogArticle_hero_meta">
              <p className="BlogArticle_hero_author">Автор: {displayArticle.author}</p>
              <p className="BlogArticle_hero_date">Дата публикации: {displayArticle.date}</p>
            </div>
          </div>
        </div>
      </div>

      {storyConfig.scenes.length > 0 && (
        <div className="BlogArticle_story_wrap">
          <TeaStoryScroller config={storyConfig} className="BlogArticle_story" />
        </div>
      )}

      <div className="container">
        <div className="BlogArticle_related">
          <div className="BlogArticle_related_header">
            <h2 className="BlogArticle_related_title">Статьи</h2>
            <a href="/blog" className="BlogArticle_all_articles_link">
              Все статьи <img src={Pointer} alt="" />
            </a>
          </div>

          <div className="BlogArticle_related_grid">
            {(displayArticle.relatedArticles || []).map((relatedArticle, index) => (
              <a
                key={relatedArticle.id}
                href={`/blog/${relatedArticle.id}`}
                className={`BlogArticle_related_card ${index === 0 ? 'large' : 'medium'}`}
              >
                <div className="BlogArticle_related_card_image_wrapper">
                  <img
                    src={relatedArticle.image}
                    alt={relatedArticle.title}
                    className="BlogArticle_related_card_image"
                  />
                  <div className="BlogArticle_related_card_overlay">
                    <span className="BlogArticle_related_card_tag">Журнал</span>
                    <button className="BlogArticle_related_card_btn" type="button">
                      Читать статью <img src={Pointer} alt="" />
                    </button>
                  </div>
                </div>
                <div className="BlogArticle_related_card_content">
                  <h3 className="BlogArticle_related_card_title">{relatedArticle.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle;

import React from 'react';
import './CatalogCategories.css';
import GreyPointer from "../../../assets/Image/GreyPointer.svg";
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import Breadcrumbs from "../../Breadcrumbs/Breadcrumbs.jsx";
import { getCatalogTileLink } from '../../../constants/catalogTonicLinks.js';

export const CatalogCategories = () => {
    const categories = [
        {
            id: 1,
            name: 'Весь чай',
            image: SITE_IMAGES.sencha,
            link: null,
            size: 'large',
            shadowColor: '86, 139, 105'
        },
        {
            id: 2,
            name: 'Улун',
            image: SITE_IMAGES.daHongPao,
            link: null,
            size: 'small',
            shadowColor: '133, 172, 109'
        },
        {
            id: 3,
            name: 'Матча',
            image: SITE_IMAGES.whiteTea,
            link: null,
            size: 'small',
            shadowColor: '106, 156, 101'
        },
        {
            id: 4,
            name: 'Жасминовый чай',
            image: SITE_IMAGES.matcha,
            link: null,
            size: 'small',
            shadowColor: '159, 168, 94'
        },
        {
            id: 5,
            name: 'Пуэр',
            image: SITE_IMAGES.puer,
            link: null,
            size: 'small',
            shadowColor: '79, 124, 87'
        },
        {
            id: 6,
            name: 'Сенча\nПремиум',
            image: SITE_IMAGES.gifts,
            link: null,
            size: 'large',
            shadowColor: '70, 120, 82'
        }
    ];

    return (

        <section className="CatalogCategories_section container">
            <Breadcrumbs/>


            <div className="CatalogCategories_grid">
                {categories.map((category) => (
                    <a
                        key={category.id}
                        href={category.link ?? getCatalogTileLink(category.name)}
                        className={`CatalogCategories_card CatalogCategories_card--${category.size}`}
                        style={{
                            '--shadow-color': category.shadowColor
                        }}
                    >
                        <div className="CatalogCategories_card_image">
                            <img src={category.image} alt={category.name} />
                        </div>

                        <div className="CatalogCategories_card_content">
                            <div className="CatalogCategories_card_link">
                                <span>Перейти в раздел</span>
                                <img src={GreyPointer} alt="pointer" />
                            </div>

                            <h3 className="CatalogCategories_card_title">
                                {category.name}
                            </h3>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
};

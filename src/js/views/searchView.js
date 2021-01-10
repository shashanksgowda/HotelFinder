import {elements} from './base';

export const getInput = () => {
    return elements.searchInput.value;
}

export const renderRecipes = recipes => {
    recipes.forEach(element => {
        console.log(element);
        renderRecipe(element);
    });
}

const renderRecipe = recipe => {
    /*
        image_url: "http://forkify-api.herokuapp.com/images/best_pizza_dough_recipe1b20.jpg"
        publisher: "101 Cookbooks"
        publisher_url: "http://www.101cookbooks.com"
        recipe_id: "47746"
        social_rank: 100
        source_url: "http://www.101cookbooks.com/archives/001199.html"
        title: "Best Pizza Dough Ever"
    */
    const markup = `
        <li>
            <a class="results__link results__link--active" href="#${recipe.recipe_id}" id="${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${recipe.title}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML("beforeend", markup);
}

export const clearInputField = () => {
    elements.searchInput.value = '';
}

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

export const renderResult = (recipes, page=2, resperPage=5) => {
    const start = (page - 1) * resperPage;
    const end = start + resperPage;
    recipes.slice(start, end).forEach(renderRecipe);

    //render button
    renderButton(page, recipes.length, resperPage);
}

const createButton = (page, type) => 
    `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
    `

export const renderButton = (page, numOfResults, resultsPerPage) => {
    const pages = Math.ceil(numOfResults / resultsPerPage);
    let button;
    if (page === 1 && pages > 1) {
        button = createButton(page, 'next')
    } else if (page === pages) {
        button = createButton(page, 'prev')
    } else {
        button = ` 
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    }
    
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    if (document.querySelector(`.results__link[href*="#${id}"]`)) document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        // return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}
import Search from './models/Search';
import {elements, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import Recepi from './models/Recepi';
import List from './models/List'
import * as recipeView from './views/recepiView';
import * as listView from './views/listView';
import Likes from './models/Likes';
import * as likesView from './views/likesView'


/** Global state of the App
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipe
 */
const state = {

};

const controlSearh = async () => {
    //Get from view
    const query = searchView.getInput();
    console.log(`Input from search field ${query}`); 
    if (query) {
        //clear results
        searchView.clearResults();

        //Create search object
        state.search = new Search(query);

        //clear search fields
        searchView.clearInputField();
        
        //Render spinner
        renderLoader(elements.searchRes);
        //fetch results
        await state.search.getResults();

        clearLoader();

        //searchView.renderRecipes(state.search.result);

        searchView.renderResult(state.search.result);

        elements.searchResPages.addEventListener('click', e => {
            const btn = e.target.closest('.btn-inline');
            if (btn) {
                const gotoPage = parseInt(btn.dataset.goto, 10);
                searchView.clearResults();
                searchView.renderResult(state.search.result, gotoPage);
                //console.log(gotoPage);
            }
        })

        elements.recipe.addEventListener('click', e => {
            const recipe = new Recepi(e.target.value)
        })
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearh();
})

const controlRecepi = async() => {
    const id = window.location.hash.replace('#', '');

    

    if (id){
        state.recepi = new Recepi(id);
        try {
            await state.recepi.getRecipe();

            state.recepi.calcTime();
            state.recepi.calcServings();
            searchView.highlightSelected(id)
        } catch(err) {
            alert('Error while processing recepi')
            clearLoader();
        }
    } else {
        state.recepi = new Recepi(46943);

        try {
            await state.recepi.getRecipe();

            state.recepi.calcTime();
            state.recepi.calcServings();
        } catch(err) {
            alert('Error while processing recepi')
            clearLoader();
        }
    }
    recipeView.clearRecipe();
    searchView.highlightSelected(id);
    recipeView.renderRecipe(state.recepi, false);
}

window.addEventListener('hashchange', controlRecepi);
window.addEventListener('load', controlRecepi);

//['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecepi))



/** 
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();
    // Add each ingredient to the list and UI
    // state.recepi.ingredients.forEach(el => {
    //     const item = state.list.addItem(el);
    //     listView.renderItem(item);
    // });

    if (state.recepi.count) {
        alert(state.recepi.title + ' is already added')
    } else {
        state.recepi.count = 1;
        const item = state.list.addItem(state.recepi.title, state.recepi.count);
        listView.renderItem(item);
    }
    
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/** 
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recepi.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recepi.title,
            state.recepi.author,
            state.recepi.img
        );
        console.log(newLike)
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recepi.servings > 1) {
            state.recepi.updateServings('dec');
            recipeView.updateServingsIngredients(state.recepi);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recepi.updateServings('inc');
        recipeView.updateServingsIngredients(state.recepi);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        console.log(state.recepi.ingredients)
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});

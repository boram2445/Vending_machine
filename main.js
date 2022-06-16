'use strict';

function loadItems(){
    return fetch('./data.json')
        .then(response => response.json()) //.json()을통해 response의 body를 object로 변환 가능.
        .then(json => json.items);
}

function displayItems(items){
    const container = document.querySelector('.list-item');
    container.innerHTML = items.map(item => createItem(item)).join('');
}

function createItem(item){
    return `
    <li>
        <button type="button" class="btn-item">
            <img src=${item.src} class="img-item">
            <strong class="tit-item">${item.name}</strong>
            <span class="txt-price">${item.price}원</span>
        </button>
    </li>
    `
}

loadItems()
    .then(items => {
        console.log(items);
        displayItems(items); 
    })
    .catch(console.log());
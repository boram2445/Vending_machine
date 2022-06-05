'use strict';

/*
구현 순서
1. 음료 클릭하면 장바구니에 담기 
1-1. 한번 클릭시 리스트에
1-2. 두번이상 클릭시 숫자 증가 
1-3. 재고보다 많이 클릭하면 품절 처리 
=> 객체 배열로 음료 저장 (이름, 가격, 개수)
*/
const drinkList = [
    {name:'Original_Cola', price:1000, amount:5},
    {name:'Violet_Cola', price:1000, amount:5},
    {name:'Yellow_Cola', price:1000, amount:5},
    {name:'Cool_Cola', price:1000, amount:5},
    {name:'Green_Cola', price:1000, amount:5},
    {name:'Orange_Cola', price:1000, amount:5},
];

const cartList = [];

const listItems = document.querySelector('.list-item');
const listStaged = document.querySelector('.list-item-staged');

listItems.addEventListener('click',  addCartItem);

// 1. 음료 클릭해서 카트에 담기 
function addCartItem(event){
    const nowBtn = event.target.tagName === 'BUTTON'? event.target : event.target.parentNode;
    if(nowBtn.tagName !== 'BUTTON'){
        return; 
    }
    let name = nowBtn.children[1].textContent;
    let selected = drinkList.filter(item => item.name === name);
    addItemToCartList(...selected,nowBtn);
    //클릭시 마다 초기화해주는데 좋지 않은 코드인듯..
    listStaged.innerHTML = '';
    cartList.forEach(item => {
        let list = makeItemCart(item.name, item.num);
        listStaged.append(list);
    })
}

// 선택한 아이템 카트 배열에 담기 
function addItemToCartList(selected,nowBtn){
    let flag = 1; 
    cartList.forEach(item => {
        //카트 배열에 있는 경우 - 숫자 증가 
        if(item.name === selected.name){
            item.num++; 
            //재고보다 많이 클릭한 경우 soldout 함수 호출
            if(item.num >= selected.amount){
                onSoldOut(nowBtn);
            }
            flag = 0;
        } 
    })
    //카트 배열에 없는 경우 - 아이템 생성
    if(flag){
        cartList.push({name:selected.name, price:selected.price, num:1});
    }
}

//아이템 생성 
function makeItemCart(name, num){
    const item = document.createElement('li');
    item.innerHTML = `
    <button type="button" class="btn-staged">
        <img src="images/${name}.png" class="img-item-staged">
        <strong class="tit-item-staged">${name}</strong>
        <span class="price-item-staged">${num}</span>
    </button>`;
    return item;
}

function onSoldOut(nowBtn){
    nowBtn.classList.add('sold-out');
}




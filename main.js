'use strict';
const container = document.querySelector('.list-item');
const cartContainer = document.querySelector('.list-item-staged');
let items = [];
let cart = [];
let myBeverage = [];
let inputMoney = 0;
let myMoney = 30000;

//0. data 받아오기 
function loadItems(){
    return fetch('./data.json')
        .then(response => response.json()) //.json()을통해 response의 body를 object로 변환 가능.
        .then(json =>{
            items = [...json.items];
            return json.items
        });
}

//1. 음료 아이템을 컨테이너에 만들어주기 
function displayItems(items){
    items.forEach(data => {
        const li = document.createElement('li');
        li.dataset.id = data.id; 
        li.innerHTML = `
            <button type="button" class="btn-item">
                <img src=${data.src} class="img-item">
                <strong class="tit-item">${data.name}</strong>
                <span class="txt-price">${data.price}원</span>
            </button>`;
        container.append(li);
    })
}

//2. 카트 담기 기능 
function addCart(){
    cartContainer.innerHTML = cart.map((item)=>createCartItem(item)).join('');
}

function createCartItem(item){
    return `
        <li data-id = ${item.id}>
            <button type="button" class="btn-staged">
                <img src=${item.src} class="img-item-staged">
                <strong class="tit-item-staged">${item.name}</strong>
                <span class="price-item-staged">${item.cart}</span>
            </button>
        </li>`;
}

//2-1. 클릭된 아이템을 재고, 수량 관리 
function setEventListener(){
    container.addEventListener('click', (event)=>{
        let target = event.target;
        if(target.parentNode.tagName === 'SECTION') return;
        const clicked = target.tagName === 'BUTTON' ? target.parentNode :  target.parentNode.parentNode;
        let itemIndex = items.findIndex((item)=> item.id == clicked.dataset.id);
        let cartIndex = cart.findIndex((item)=> item.id === items[itemIndex].id);
        if(cart.length === 0 || cartIndex === -1){
            items[itemIndex].cart+=1;
            cart.unshift(items[itemIndex]);
        } else{
            cart[cartIndex].cart +=1; 
        }
        items[itemIndex].stock-=1;
        handleSoldOut(items[itemIndex]);
        addCart();
    })
}

//2-2. 카트 선택 취소 
function removeCart(){
    cartContainer.addEventListener('click', (event)=>{
        if(event.target.tagName === 'UL') return; 
        let target = event.target.tagName === 'BUTTON' ? event.target.parentNode : event.target.parentNode.parentNode;
        let itemIndex = items.findIndex((item)=> item.id == target.dataset.id);
        let cartIndex = cart.findIndex((item)=> item.id == target.dataset.id);
        items[itemIndex].stock+=1;
        cart[cartIndex].cart-=1; 
        if(cart[cartIndex].cart===0){
            cart.splice(cartIndex,1);
        }
        handleSoldOut(items[itemIndex]);
        addCart();
    })
}

//2-3.재고 처리 
function handleSoldOut(item){
    const soldOutItem = document.querySelector(`[data-id="${item.id}"]`);
    if(item.stock === 0){
        soldOutItem.firstElementChild.classList.add('sold-out');
    } else{
        soldOutItem.firstElementChild.classList.remove('sold-out');
    }
}

/*3.입금액 입력 
3-1. 입금액 입력안하고 획득 누르면, 금액을 입력하세요 알림
3-2. 입금액을 입력하고 -> 입금 버튼 누르면 -> 잔액 업데이트 -> 소지금 줄이기 
3-3. 입금액이 있는 상태에서 -> 획득 눌렀는데 잔액이 부족하면 -> 잔액이 부족합니다.
                        -> 잔액이 있으면 -> 잔액 = 잔액-총금액 => 획득한 음료에 추가하기 
3-4. 거스름돈 반환 버튼 누르면 -> 소지금에 넣기 
*/

//3. 입금액 입력 기능
const balance = document.querySelector('.txt-balance');
function addMondy(){
    const input = document.querySelector('.inp-put');
    const inputBtn = document.querySelector('.btn-put');
    inputBtn.addEventListener('click', ()=>{
        if(input.value == '') return; 
        let leftMoney = myMoney-parseInt(input.value);
        if(leftMoney < 0){
            alert('⛔소지한 금액이 부족합니다.');
            return; 
        }
        inputMoney+=parseInt(input.value);
        myMoney=leftMoney;
        input.value = '';
        balance.textContent = `${inputMoney} 원`;
    })
}

//3-1. 카트상품 획득 기능 
function getItem(){
    const getBtn = document.querySelector('.btn-get');
    getBtn.addEventListener('click',()=>{
        if(cart.length === 0){
            alert('🥤음료를 선택해주세요');
            return;
        }
        if(inputMoney === 0){
            alert('💵돈을 투입해 주세요');
            return;
        }
        let cartCost = 0;
        cart.forEach((item)=>{cartCost+=(item.price*item.cart)});
        if(cartCost > inputMoney){
            alert('💵잔액이 부족합니다. 돈을 더 투입해주세요');
            return;
        }
        myBeverage = [...cart];
        cart.forEach((item)=>item.cart = 0);
        balance.textContent = `${inputMoney-cartCost} 원`;
        inputMoney = 0;
        cart = [];
        addCart();
        cartCost = 0;
    })
}

loadItems()
    .then(items => {
        displayItems(items); 
        setEventListener(items); 
        removeCart(); 
        addMondy();
        getItem(); 
    })
    .catch(console.log());

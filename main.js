'use strict';
const container = document.querySelector('.list-item');
const cartContainer = document.querySelector('.list-item-staged');
const txtMyMoney = document.querySelector('.txt-mymoney');
let items = [];
let cart = [];
let myBeverage = [];
let inputMoney = 0;
let myMoney = 30000;
let totalPay = 0;

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
function displayItems(){
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
function addItems(arr, type){
    return arr.map((item)=>createItem(item, type)).join('');
}

function createItem(item,type){
    return `
    <li data-id = ${item.id}>
        <button type="button" class="btn-staged">
            <img src=${item.src} class="img-item-staged">
            <strong class="tit-item-staged">${item.name}</strong>
            <span class="price-item-staged">${type==='cart' ? item.cart : item.mine}</span>
        </button>
    </li>`;
}

//2-1. 카트에 담기
function addCart(){
    container.addEventListener('click', (event)=>{
        let target = event.target;
        if(target.parentNode.tagName === 'SECTION') return;
        const clicked = target.tagName === 'BUTTON' ? target.parentNode :  target.parentNode.parentNode;
        let itemIndex = items.findIndex((item)=> item.id == clicked.dataset.id);
        let cartIndex = cart.findIndex((item)=> item.id == items[itemIndex].id);
        if(cart.length === 0 || cartIndex === -1){
            items[itemIndex].cart+=1;
            cart.unshift(items[itemIndex]);
        } else{
            cart[cartIndex].cart +=1; 
        }
        items[itemIndex].stock-=1;
        handleSoldOut(items[itemIndex]);
        cartContainer.innerHTML = addItems(cart,'cart');
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
        cartContainer.innerHTML = addItems(cart,'cart');
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

const balance = document.querySelector('.txt-balance');
const txtTotalPay = document.querySelector('.txt-total');
const myBeverageList = document.querySelector('.list-myitem');
const btnBalance = document.querySelector('.btn-balance');
//3. 입금액 입력 기능

//3.1 입금액 적절성 판단 
function isValidMoney(money){
    if(money == '') return; 
    if(isNaN(money)){
        alert('입력값을 확인해 주세요');
        money = '';
        return;
    }
    let leftMoney = myMoney-parseInt(money);
    if(leftMoney < 0){
        alert('⛔소지금이 부족합니다.');
        return; 
    }
    return leftMoney; 
}

//3-2. 입금 기능 
function addMoney(){
    const input = document.querySelector('.inp-put');
    const inputBtn = document.querySelector('.btn-put');
    inputBtn.addEventListener('click', ()=>{
        let leftMoney = isValidMoney(input.value);
        if(!leftMoney) return; 
        inputMoney+=parseInt(input.value);
        myMoney=leftMoney;
        input.value = '';
        txtMyMoney.textContent = `${makeMoneyDot(myMoney)} 원`;
        balance.textContent = `${makeMoneyDot(inputMoney)} 원`;
    })
}

//3-3. 거스름돈 반환 기능
function backMoney(){
    btnBalance.addEventListener('click',()=>{
        myMoney+=inputMoney;
        inputMoney = 0;
        txtMyMoney.textContent = `${makeMoneyDot(myMoney)} 원`;
        balance.textContent = `${makeMoneyDot(inputMoney)} 원`;
    })
}

//4. 카트상품 획득 기능 
//4-1. 카트 상품 구매 가능 판단
function isValidBuy(cartCost){
    if(cart.length === 0){
        alert('🥤음료를 선택해주세요');
        return;
    }
    if(inputMoney === 0){
        alert('💵돈을 투입해 주세요');
        return;
    }
    cart.forEach((item)=>{cartCost+=(item.price*item.cart)});
    if(cartCost > inputMoney){
        alert('💵잔액이 부족합니다. 돈을 더 투입해주세요');
        return;
    }
    return cartCost;
}

//4-2. 카트 클리어 기능
function clearCart(){
    cart = [];
    items.forEach((item)=>item.cart = 0);
    cartContainer.innerHTML = '';
}

//4-3. 카트 아이템 획득 기능
function getItem(){
    const getBtn = document.querySelector('.btn-get');
    getBtn.addEventListener('click',()=>{
        let cartCost = 0;
        cartCost = isValidBuy(cartCost);
        if(!cartCost) return;
        cart.forEach((item)=>{
            let myIndex = myBeverage.findIndex((myItem)=>myItem.id == item.id);
            if( myIndex === -1){
                item.mine = item.cart; 
                myBeverage.push(item);
            } else{
                myBeverage[myIndex].mine += item.cart;
            }
        })
        totalPay+=cartCost;
        balance.textContent = `${makeMoneyDot(inputMoney-cartCost)} 원`;
        txtTotalPay.textContent = `총금액 : ${makeMoneyDot(totalPay)}원`;
        myBeverageList.innerHTML = addItems(myBeverage,'mine');
        inputMoney = inputMoney-cartCost;
        clearCart(); 
    })
}

function makeMoneyDot(money){
    let reverseNum = money.toString().split('').reverse();
    for(let i=3; i<reverseNum.length; i+=3){
        reverseNum.splice(i,0,',');
    }
    let result = reverseNum.reverse().join('');
    return result;
}

function init(items){
    txtMyMoney.textContent = `${makeMoneyDot(myMoney)} 원`;
    displayItems(); 
    addCart(); 
    removeCart(); 
    addMoney();
    backMoney();
    getItem(); 
}

loadItems()
    .then(() => init())
    .catch(console.log('음료 데이터를 불러오지 못했습니다.'));
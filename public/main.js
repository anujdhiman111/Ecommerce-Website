if(window.location.pathname === "/"){
    onLoad();
}

function onLoad(){
    let count = 1;
    let request = new XMLHttpRequest();
    request.open("GET","/countData");
    request.send();
    request.addEventListener("load",function(){
      let data = JSON.parse(request.responseText);
      let ul = document.createElement("ul");
      let page = Math.ceil(data.length/5);
      for(let i = 1;i<=page;i++){
        let a = document.createElement("a");
        a.style["cursor"] = "pointer"
        a.addEventListener("click",changeContent);
        a.innerText = i;
        let li = document.createElement("li");
        li.appendChild(a);
        ul.appendChild(li);
      }
      document.body.appendChild(ul);
    });
  }

function changeContent(event){
    let request = new XMLHttpRequest();
    request.open("POST","/filterData");
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify({id1:event.target.innerText}));
    request.addEventListener("load",function(){
      document.getElementsByClassName("container1")[0].innerHTML = "";
      let newData = JSON.parse(request.responseText);
      newData.forEach(function(data){
        let div = document.createElement("div");
        div.setAttribute("class","gridContent")
        let img = document.createElement("img");
        img.src = data.picName
        let h1 = document.createElement("h2");
        let p = document.createElement("p");
        p.innerText = `$ ${data.inputPrice}`
        h1.innerText = data.inputText
        let button = document.createElement("button");
        button.setAttribute("class","viewDetail")
        let cartButton = document.createElement("button");
        cartButton.setAttribute("class","addToCart")
        button.innerText = "View Details";
        cartButton.innerText = "Add To Cart";
        button.setAttribute("id",data._id);
        cartButton.setAttribute("id",`cart${data._id}`);
        button.addEventListener('click',showDetails);
        cartButton.addEventListener('click',addToCart);
        div.append(img,h1,p,button,cartButton);
        document.getElementsByClassName("container1")[0].appendChild(div);
      })
    })
  }
    
  function showDetails(event){
    let request = new XMLHttpRequest();
    request.open("POST","/getData");
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify({key:event.target.id}));
    request.addEventListener("load",function(){
      let data = JSON.parse(request.responseText);
      alert(data)
    });
  }

  function addToCart(event){
    let request = new XMLHttpRequest();
    request.open("POST","/addData");
    request.setRequestHeader("Content-Type","application/json");
    let newId = event.target.id.slice(4);
    request.send(JSON.stringify({name:event.target.parentNode.children[1].innerText,price:event.target.parentNode.children[2].innerText,img:event.target.parentNode.children[0].src.slice(22),id1:newId,quantity:1}));
    console.log(event.target.id.slice(4));
    request.addEventListener("load",function(){
      if(request.responseText === "/"){
        window.location.href = request.responseText
      }
      else{
        window.location.href = "/login";
      }
    })
  }


  function showProducts(){
    console.log("yes");
    let newDiv = document.getElementById("allProduct");
    let request = new XMLHttpRequest();
    request.open("GET","/getAllData");
    request.send();
    request.addEventListener("load",function(){
      let data = JSON.parse(request.responseText);
      let newData = data.data;
      for(let x of newData){
        let itemDiv = document.createElement("div");
        let itemImg = document.createElement("img");
        let itemName = document.createElement("h2");
        let itemPrice = document.createElement("h6");
        let itemDesc = document.createElement("p");
        let itemUpdateBtn = document.createElement("button");
        let itemDeleteBtn = document.createElement("button");
        itemImg.setAttribute("src",x.picName);
        itemImg.setAttribute("class","itemImage");
        itemName.innerText = x.inputText;
        itemName.setAttribute("class","itemName");
        itemPrice.innerText = `$${x.inputPrice}`;
        itemPrice.setAttribute("class","itemPrice");
        itemDesc.innerText = x.desc;
        itemDesc.setAttribute("class","itemDesc");
        itemPrice.setAttribute("id",`p${x._id}`);
        itemUpdateBtn.innerText = "Update";
        itemUpdateBtn.setAttribute("id",x._id);
        itemUpdateBtn.addEventListener("click",function(event){
          let ans = prompt("Enter the price");
          if(ans!=""){
            let request2 = new XMLHttpRequest();
            request2.open("POST","/updatePrice");
            request2.setRequestHeader("Content-Type","application/json");
            request2.send(JSON.stringify({updatePrice:ans,key:event.target.id}));
            request2.addEventListener("load",function(){
              document.getElementById(`p${event.target.id}`).innerText = ans;
            })
          }
        })
        itemDeleteBtn.innerText = "Delete";
        itemDeleteBtn.setAttribute("id",x._id);
        itemDeleteBtn.addEventListener("click",function(event){
          let ans = prompt("Are u sure u want to delete it, After deleting it also delete from the database. y/n");
          if(ans == "y" || ans == "Y"){
            let request1 = new XMLHttpRequest();
            request1.open("POST","/deleteItem");
            request1.setRequestHeader("Content-Type","application/json");
            request1.send(JSON.stringify({key:event.target.id}));
            request1.addEventListener("load",function(){
              event.target.parentNode.remove();
            })
          }
        })
        itemDiv.append(itemImg,itemName,itemPrice,itemDesc,itemUpdateBtn,itemDeleteBtn);
        newDiv.appendChild(itemDiv);
        newDiv.style["display"] = "block";
      }
    })
  }
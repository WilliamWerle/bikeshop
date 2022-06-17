var express = require('express');
var router = express.Router();

const app = express();
const stripe = require('stripe')('sk_test_51LBaIqESSHxh75cd2pUvNN5Z7dUixrhFXbLUsMWKyM4l8SIQ1SFKE8mzURt1bjUtw4uDL6yYFKiJOF6LDXngzyoq006r8k0eu3')

var dataBike = [
  {name:"Charles Leclerc", url:"/images/bike-1.jpg", price:679},
  {name:"Romain Grosjean", url:"/images/bike-2.jpg", price:999},
  {name:"Mick Schumacher", url:"/images/bike-3.jpg", price:799},
  {name:"Lando Norris", url:"/images/bike-4.jpg", price:1300},
  {name:"Pierre Gasly", url:"/images/bike-5.jpg", price:479},
  {name:"Carlos Sainz", url:"/images/bike-6.jpg", price:869},
]

//var dataCardBike = []

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = []
  }
  res.render('index', {dataBike:dataBike});
});

//route qui ajoute un vélo dans le panier à partir de la page index, et qui augmente la quantité si le modèle est déjà présent
router.get('/shop', function(req, res, next) {
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = []
  }

  var itemExist = false

 for (var i= 0; i < req.session.dataCardBike.length ; i++) {
  if (req.query.name === req.session.dataCardBike[i].name) {
    req.session.dataCardBike[i].quantity++ ;
    itemExist = true
  }}
  if(itemExist === false){
    req.session.dataCardBike.push({
      name: req.query.name,
      url: req.query.img,
      price: req.query.price,
      quantity: 1
      })
  }
  
  res.render('shop', {dataCardBike : req.session.dataCardBike});
});

//route qui permet de supprimer une ligne du panier
router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike: req.session.dataCardBike})
})

//route qui update la quantité de vélo 
router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike: req.session.dataCardBike})
})

// requete stripe pour le paiement
var totalBasket = 0

router.post('/create-checkout-session', async (req, res) => {
  
  for(var i = 0 ; i<req.session.dataCardBike.length ; i++){
    totalBasket += req.session.dataCardBike[i].price*100
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'F1 BIKE',
            
          },
          unit_amount: totalBasket,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  res.redirect(303, session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
//fin de la requete

//routes pour la page succes et cancel du paiement
router.get('/success', function(req, res, next) {
  res.render('success', {});
});

router.get('/cancel', function(req, res, next) {
  res.render('cancel', {});
});


module.exports = router;

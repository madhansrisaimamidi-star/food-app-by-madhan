(() => {
  const restaurantNames = [
    "Crust & Craft", "Burger Singh", "Green Theory", "The Biryani House",
    "Madras Morning", "Wok This Way", "Sugar Rush", "Juice Junction",
    "Tandoori Trails", "Dosa District", "Chai & Co.", "Naan Stop",
    "The Pasta Project", "Kebab Kingdom", "Dragon Bowl", "Wrap Street",
    "Coastal Curry", "The Salad Lab", "Momo Nation", "Taco Town",
    "The Breakfast Club", "Rice Republic", "Spice Route", "Cocoa Corner",
    "Grill Theory", "Idli Stories", "The Soup Spot", "Pizza Theory",
    "Bowl & Bloom", "The Dessert Room", "Cafe Mocha", "Royal Thali",
    "Street Wok", "The Sandwich Co.", "Fresh Press", "Biryani Blues",
    "Pancake Pantry", "Sushi Social", "The Samosa Story", "Flame & Fork",
    "Curry Culture", "Cookie Cloud"
  ];
  const categories = [
    {name:"Pizza", emoji:"🍕", bases:["Margherita", "Farmhouse", "Peri Peri Paneer", "Smoky Corn", "Truffle Mushroom", "Four Cheese", "Tandoori Chicken", "Pesto Veg"]},
    {name:"Burgers", emoji:"🍔", bases:["Classic Smash", "Crispy Paneer", "Spicy Chicken", "BBQ Mushroom", "Double Cheese", "Peri Peri Chicken", "Aloo Crunch", "Bacon Pepper"]},
    {name:"Biryani", emoji:"🍛", bases:["Hyderabadi Chicken", "Lucknowi Mutton", "Veg Dum", "Egg Special", "Paneer Tikka", "Kolkata Chicken", "Malabar Fish", "Jackfruit Dum"]},
    {name:"South Indian", emoji:"🥞", bases:["Masala Dosa", "Ghee Podi Idli", "Mysore Set Dosa", "Medu Vada", "Pesarattu", "Onion Uttapam", "Rava Dosa", "Curd Rice"]},
    {name:"Chinese", emoji:"🍜", bases:["Hakka Noodles", "Schezwan Rice", "Chilli Paneer", "Manchurian", "Spring Rolls", "Dan Dan Noodles", "Kung Pao Chicken", "Dim Sum"]},
    {name:"Desserts", emoji:"🍰", bases:["Belgian Chocolate", "Mango Cheesecake", "Red Velvet", "Gulab Jamun", "Tiramisu", "Brownie Sundae", "Pistachio Kulfi", "Caramel Custard"]},
    {name:"Beverages", emoji:"🥤", bases:["Mango Cooler", "Cold Coffee", "Masala Chai", "Berry Smoothie", "Fresh Lime", "Tender Coconut", "Iced Tea", "Chocolate Shake"]},
    {name:"Healthy", emoji:"🥗", bases:["Protein Bowl", "Avocado Salad", "Quinoa Power Bowl", "Rainbow Salad", "Hummus Plate", "Millet Bowl", "Sprout Chaat", "Green Smoothie"]}
  ];
  const tags = ["Signature", "Chef's Special", "Family Size", "Spicy", "Classic", "House Favourite"];
  const foodItems = [];
  restaurantNames.forEach((restaurant, restaurantIndex) => {
    for (let itemIndex = 0; itemIndex < 24; itemIndex += 1) {
      const category = categories[(restaurantIndex + itemIndex) % categories.length];
      const base = category.bases[itemIndex % category.bases.length];
      const tag = tags[(restaurantIndex + itemIndex) % tags.length];
      foodItems.push({
        id: restaurantIndex * 24 + itemIndex + 1,
        restaurantId: restaurantIndex + 1,
        restaurant,
        name: `${base} ${tag} ${restaurantIndex + 1}-${itemIndex + 1}`,
        description: `${tag} ${base.toLowerCase()} prepared fresh at ${restaurant}.`,
        category: category.name,
        emoji: category.emoji,
        price: 119 + ((restaurantIndex * 37 + itemIndex * 23) % 381),
        vegetarian: (restaurantIndex + itemIndex) % 3 !== 0,
        rating: (4.1 + ((restaurantIndex + itemIndex) % 9) / 10).toFixed(1)
      });
    }
  });
  const restaurants = restaurantNames.map((name, index) => {
    const firstItem = foodItems[index * 24];
    return {
      id: index + 1, name, cuisine: `${categories[index % categories.length].name} · Indian`,
      rating: (4.2 + (index % 8) / 10).toFixed(1), time: `${15 + (index % 4) * 5}–${20 + (index % 4) * 5} min`,
      price: index % 3 === 0 ? "₹" : "₹₹", category: firstItem.category, emoji: categories[index % categories.length].emoji,
      image: `image-${(index % 6) + 1}`, itemCount: 24
    };
  });
  window.foodData = {restaurants, foodItems, categories};
})();

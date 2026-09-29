package com.bitedash.config;

import com.bitedash.entity.FoodItem;
import com.bitedash.entity.Restaurant;
import com.bitedash.entity.Role;
import com.bitedash.entity.User;
import com.bitedash.repository.FoodItemRepository;
import com.bitedash.repository.RestaurantRepository;
import com.bitedash.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RestaurantRepository restaurantRepository,
                           FoodItemRepository foodItemRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedRestaurantsAndFoodItems();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User customer = new User("Alex Smith", "alex@email.com", passwordEncoder.encode("password123"));
            userRepository.save(customer);

            User admin = new User("Admin", "admin@foodieexpress.com", passwordEncoder.encode("admin123"));
            userRepository.save(admin);
        }
    }

    private void seedRestaurantsAndFoodItems() {
        if (restaurantRepository.count() == 0) {
            Restaurant r1 = restaurantRepository.save(new Restaurant(
                    "Crust & Craft", "Italian · Pizza", "Koramangala 4th Block, Bengaluru",
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.8"), "25–30 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r1, "Margherita Supreme", "San Marzano tomatoes, fresh buffalo mozzarella, fresh basil", "Pizza", new BigDecimal("329.00"), "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r1, "Truffle Mushroom Pizza", "Wild forest mushrooms, creamy fontina cheese, white truffle oil", "Pizza", new BigDecimal("449.00"), "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r1, "Peri Peri Paneer Flatbread", "Fiery marinated cottage cheese cubes, sweet bell peppers, red onion", "Pizza", new BigDecimal("369.00"), "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80", true)
            ));

            Restaurant r2 = restaurantRepository.save(new Restaurant(
                    "Burger Singh", "Burgers · American", "Indiranagar 100ft Road, Bengaluru",
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.7"), "20–25 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r2, "Classic Smash Burger", "Double smashed patties, cheddar melt, secret relish, potato bun", "Burgers", new BigDecimal("249.00"), "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r2, "Crispy Paneer Royale", "Spiced golden crumbed paneer, chipotle mayo, crunchy iceberg lettuce", "Burgers", new BigDecimal("219.00"), "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r2, "Truffle Parmesan Fries", "Hand-cut golden fries tossed with parmesan shavings and black truffle oil", "Burgers", new BigDecimal("149.00"), "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80", true)
            ));

            Restaurant r3 = restaurantRepository.save(new Restaurant(
                    "Green Theory", "Healthy · Salads", "Residency Road, Bengaluru",
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.9"), "15–20 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r3, "Avocado Quinoa Power Bowl", "Ripe Hass avocados, organic tri-color quinoa, pumpkin seeds, tahini dip", "Healthy", new BigDecimal("320.00"), "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r3, "Greek Mediterranean Salad", "Crisp cucumbers, kalamata olives, heirloom cherry tomatoes, feta crumbles", "Healthy", new BigDecimal("280.00"), "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80", true)
            ));

            Restaurant r4 = restaurantRepository.save(new Restaurant(
                    "The Biryani House", "Indian · Biryani", "HSR Layout Sector 1, Bengaluru",
                    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.8"), "30–35 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r4, "Royal Hyderabadi Dum Biryani", "Aromatic long-grain basmati, saffron, slow-cooked in handi, served with mirchi ka salan", "Biryani", new BigDecimal("349.00"), "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r4, "Paneer Tikka Biryani", "Clay-oven smoked cottage cheese cubes layered over fragrant spiced rice", "Biryani", new BigDecimal("299.00"), "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80", true)
            ));

            Restaurant r5 = restaurantRepository.save(new Restaurant(
                    "Wok This Way", "Asian · Noodles", "Church Street, Bengaluru",
                    "https://images.unsplash.com/photo-1569718157624-e67bec5b5f17?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.8"), "25–30 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r5, "Signature Hakka Noodles", "Wok-tossed hand-pulled noodles, scallions, bell peppers, oriental seasonings", "Asian", new BigDecimal("249.00"), "https://images.unsplash.com/photo-1569718157624-e67bec5b5f17?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r5, "Schezwan Chilli Paneer", "Crispy paneer cubes glazed in house-made spicy Sichuan garlic sauce", "Asian", new BigDecimal("279.00"), "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80", true)
            ));

            Restaurant r6 = restaurantRepository.save(new Restaurant(
                    "Sugar Rush", "Desserts · Bakery", "Lavelle Road, Bengaluru",
                    "https://images.unsplash.com/photo-1563729784474-d77dde43e61d?auto=format&fit=crop&w=600&h=380&q=80",
                    new BigDecimal("4.9"), "15–20 min", true
            ));
            foodItemRepository.saveAll(List.of(
                    new FoodItem(r6, "Belgian Chocolate Truffle Cake", "Rich dark chocolate ganache layered with moist sponge and gold dusted pearls", "Desserts", new BigDecimal("199.00"), "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80", true),
                    new FoodItem(r6, "New York Baked Cheesecake", "Velvety cream cheese filling over buttery biscuit crust, blueberry compote", "Desserts", new BigDecimal("229.00"), "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80", true)
            ));
        }
    }
}

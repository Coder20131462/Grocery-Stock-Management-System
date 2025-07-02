package com.grocery.config;

import com.grocery.model.Product;
import com.grocery.model.Role;
import com.grocery.model.User;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeProducts();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@grocery.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(Role.ROLE_ADMIN));
            userRepository.save(admin);

            // Create regular user
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@grocery.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRoles(Set.of(Role.ROLE_USER));
            userRepository.save(user);

            System.out.println("Default users created:");
            System.out.println("Admin - username: admin, password: admin123");
            System.out.println("User - username: user, password: user123");
        }
    }

    private void initializeProducts() {
        if (productRepository.count() == 0) {
            // Fruits & Vegetables
            productRepository.save(new Product("Apples", "Fresh red apples", "Fruits", 
                new BigDecimal("3.99"), 50, 10, "kg", "Local Farm"));
            productRepository.save(new Product("Bananas", "Ripe yellow bananas", "Fruits", 
                new BigDecimal("2.49"), 30, 5, "kg", "Tropical Farms"));
            productRepository.save(new Product("Carrots", "Fresh orange carrots", "Vegetables", 
                new BigDecimal("1.99"), 25, 5, "kg", "Green Valley"));
            productRepository.save(new Product("Spinach", "Fresh green spinach", "Vegetables", 
                new BigDecimal("2.99"), 15, 3, "bunch", "Organic Greens"));

            // Dairy Products
            productRepository.save(new Product("Milk", "Fresh whole milk", "Dairy", 
                new BigDecimal("4.99"), 20, 5, "liter", "Dairy Fresh"));
            productRepository.save(new Product("Cheese", "Cheddar cheese", "Dairy", 
                new BigDecimal("6.99"), 15, 3, "pack", "Cheese Co"));
            productRepository.save(new Product("Yogurt", "Greek yogurt", "Dairy", 
                new BigDecimal("5.49"), 25, 5, "pack", "Yogurt Plus"));

            // Grains & Cereals
            productRepository.save(new Product("Rice", "Basmati rice", "Grains", 
                new BigDecimal("8.99"), 40, 8, "kg", "Rice Mills"));
            productRepository.save(new Product("Bread", "Whole wheat bread", "Bakery", 
                new BigDecimal("3.49"), 20, 5, "loaf", "Fresh Bakery"));
            productRepository.save(new Product("Pasta", "Italian pasta", "Grains", 
                new BigDecimal("2.99"), 30, 8, "pack", "Pasta Italia"));

            // Beverages
            productRepository.save(new Product("Orange Juice", "Fresh orange juice", "Beverages", 
                new BigDecimal("4.49"), 18, 5, "liter", "Juice Fresh"));
            productRepository.save(new Product("Coffee", "Ground coffee", "Beverages", 
                new BigDecimal("12.99"), 25, 5, "pack", "Coffee Roasters"));

            System.out.println("Sample products initialized successfully!");
        }
    }
} 
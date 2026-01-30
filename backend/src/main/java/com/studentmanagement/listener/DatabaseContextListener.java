package com.studentmanagement.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import com.studentmanagement.DatabaseSetup;

/**
 * Listener to initialize the database when the application starts
 */
@WebListener
public class DatabaseContextListener implements ServletContextListener {

  @Override
  public void contextInitialized(ServletContextEvent sce) {
    System.out.println("Starting database initialization...");
    DatabaseSetup.initialize();
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {
    // Cleanup if needed
    System.out.println("Database context destroyed.");
  }
}

package com.studentmanagement.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * CORS Filter to handle cross-origin requests from the React frontend
 * This filter adds necessary CORS headers to allow frontend-backend
 * communication
 */
public class CorsFilter implements Filter {

    // Allowed origins for CORS - includes localhost, Vercel, and Render URLs
    private static final Set<String> ALLOWED_ORIGINS = new HashSet<>(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "https://student-management-system-beta-lake.vercel.app",
            "https://student-management-system.vercel.app",
            "https://student-management-system-bslx.onrender.com"));

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No initialization needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Get the origin from the request
        String origin = httpRequest.getHeader("Origin");

        // Set CORS headers - allow specific origins or any Vercel preview URLs
        String allowedOrigin = "*";
        if (origin != null) {
            if (ALLOWED_ORIGINS.contains(origin) || origin.endsWith(".vercel.app")) {
                allowedOrigin = origin;
            }
        }

        httpResponse.setHeader("Access-Control-Allow-Origin", allowedOrigin);
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
        httpResponse.setHeader("Access-Control-Allow-Headers",
                "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        httpResponse.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Type");

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Continue with the request
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // No cleanup needed
    }
}

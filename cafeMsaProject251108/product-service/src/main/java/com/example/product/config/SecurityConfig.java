package com.example.product.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableMethodSecurity   // @PreAuthorize 활성화
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // H2 콘솔 사용을 위해 CSRF & frameOptions 조정 (개발용)
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                .authorizeHttpRequests(auth -> auth
                        // ✅ 1) H2 콘솔 허용 (PathRequest 사용)
                        .requestMatchers(PathRequest.toH2Console()).permitAll()

                        // ✅ 2) 상품 조회(GET /api/products/**)는 모두 허용
                        // 문자열 말고 AntPathRequestMatcher로 명시
                        .requestMatchers(new AntPathRequestMatcher("/api/products/**", "GET")).permitAll()

                        // ✅ 3) 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // 개발 단계에선 Basic으로 테스트 (나중에 JWT 등으로 교체 가능)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    /**
     * 테스트용 인메모리 유저
     * - owner / owner1234  → ROLE_OWNER (사장, CRUD 가능)
     * - user  / user1234   → ROLE_USER  (사용자, 조회 + 장바구니)
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails owner = User.withUsername("owner")
                .password(passwordEncoder.encode("owner1234"))
                .roles("OWNER") // ROLE_OWNER
                .build();

        UserDetails user = User.withUsername("user")
                .password(passwordEncoder.encode("user1234"))
                .roles("USER") // ROLE_USER
                .build();

        return new InMemoryUserDetailsManager(owner, user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

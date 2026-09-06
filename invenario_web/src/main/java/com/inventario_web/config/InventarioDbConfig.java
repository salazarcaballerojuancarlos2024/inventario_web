package com.inventario_web.config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    entityManagerFactoryRef = "inventarioEntityManagerFactory",
    transactionManagerRef = "inventarioTransactionManager",
    basePackages = { "com.inventario_web.repositorio" }
)
public class InventarioDbConfig {

    @Primary
    @Bean(name = "inventarioProperties")
    @ConfigurationProperties("app.datasource.inventario")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean(name = "inventarioDataSource")
    public DataSource dataSource(@Qualifier("inventarioProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }

    @Primary
    @Bean(name = "inventarioEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("inventarioDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.inventario_web.model")
                .persistenceUnit("inventario")
                .build();
    }

    @Primary
    @Bean(name = "inventarioTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("inventarioEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
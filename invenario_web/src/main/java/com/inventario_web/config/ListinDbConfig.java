package com.inventario_web.config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    entityManagerFactoryRef = "listinEntityManagerFactory",
    transactionManagerRef = "listinTransactionManager",
    basePackages = { "com.inventario_web.listin.repositorio" }
)
public class ListinDbConfig {

    @Bean(name = "listinProperties")
    @ConfigurationProperties("app.datasource.listin")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "listinDataSource")
    public DataSource dataSource(@Qualifier("listinProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }

    @Bean(name = "listinEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("listinDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.inventario_web.listin.model")
                .persistenceUnit("listin")
                .build();
    }

    @Bean(name = "listinTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("listinEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
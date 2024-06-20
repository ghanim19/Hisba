import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import SalesReport from './sales';
import UserActivityReport from './user-activity';
import TopRatedStoresReport from './top-rated-stores';
import MostOrderedProductsReport from './most-ordered-products';
import styles from '../styles/Reports.module.css';
import withAuth from '../../../components/withAuth'

const Reports = () => {
    return (
        <div className={styles.container}>
            <Container>
                <Typography variant="h4" gutterBottom className={styles.title}>
                    Reports Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper className={styles.paper}>
                            <Typography variant="h5" gutterBottom className={styles.subTitle}>
                            </Typography>
                            <SalesReport />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper className={styles.paper}>
                            <Typography variant="h5" gutterBottom className={styles.subTitle}>
                            </Typography>
                            <UserActivityReport />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper className={styles.paper}>
                            <Typography variant="h5" gutterBottom className={styles.subTitle}>
                            </Typography>
                            <TopRatedStoresReport />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper className={styles.paper}>
                            <Typography variant="h5" gutterBottom className={styles.subTitle}>
                            </Typography>
                            <MostOrderedProductsReport />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default withAuth(Reports);

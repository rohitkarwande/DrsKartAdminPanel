const db = require('../config/db');

class AnalyticsService {
    async getDemandReports() {
        const mostSearched = await db.query(`
            SELECT search_query, COUNT(*) as search_count
            FROM search_analytics
            GROUP BY search_query
            ORDER BY search_count DESC
            LIMIT 10
        `).catch(() => ({ rows: [] }));

        const mostViewed = await db.query(`
            SELECT ep.id, ep.title, ep.brand, ep.category, em.view_count
            FROM engagement_metrics em
            JOIN equipment_posts ep ON em.equipment_post_id = ep.id
            ORDER BY em.view_count DESC
            LIMIT 10
        `).catch(() => ({ rows: [] }));

        return {
            mostSearched: mostSearched.rows,
            mostViewed: mostViewed.rows
        };
    }

    async getGeographicAnalytics() {
        const demandByCity = await db.query(`
            SELECT city, COUNT(*) as demand_count
            FROM analytics_events ae
            JOIN equipment_posts ep ON ae.equipment_post_id = ep.id
            WHERE ae.event_type = 'view' OR ae.event_type = 'inquiry'
            GROUP BY city
            ORDER BY demand_count DESC
        `).catch(() => ({ rows: [] }));

        const demandByState = await db.query(`
            SELECT state, COUNT(*) as demand_count
            FROM analytics_events ae
            JOIN equipment_posts ep ON ae.equipment_post_id = ep.id
            WHERE ae.event_type = 'view' OR ae.event_type = 'inquiry'
            GROUP BY state
            ORDER BY demand_count DESC
        `).catch(() => ({ rows: [] }));

        return {
            demandByCity: demandByCity.rows,
            demandByState: demandByState.rows
        };
    }

    async getTrendingEquipment() {
        const trending = await db.query(`
            SELECT ep.id, ep.title, ep.category, ep.price, em.view_count, em.save_count, em.inquiry_count,
                   (em.view_count * 1 + em.save_count * 3 + em.inquiry_count * 5) as popularity_score
            FROM engagement_metrics em
            JOIN equipment_posts ep ON em.equipment_post_id = ep.id
            WHERE ep.status = 'Active'
            ORDER BY popularity_score DESC
            LIMIT 10
        `).catch(() => ({ rows: [] }));

        return trending.rows;
    }

    async getConversionFunnel() {
        const searchTotal = await db.query("SELECT COUNT(*) as count FROM search_analytics").catch(() => ({ rows: [{ count: 0 }] }));
        const viewTotal = await db.query("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'view'").catch(() => ({ rows: [{ count: 0 }] }));
        const inquiryTotal = await db.query("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'inquiry'").catch(() => ({ rows: [{ count: 0 }] }));
        const dealTotal = await db.query("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'deal'").catch(() => ({ rows: [{ count: 0 }] }));

        return {
            funnel: {
                search: parseInt(searchTotal.rows[0]?.count || 0, 10),
                view: parseInt(viewTotal.rows[0]?.count || 0, 10),
                inquiry: parseInt(inquiryTotal.rows[0]?.count || 0, 10),
                deal: parseInt(dealTotal.rows[0]?.count || 0, 10)
            }
        };
    }
}

module.exports = new AnalyticsService();

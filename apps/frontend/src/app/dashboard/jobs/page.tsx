import JobsListClient from './JobsListClient';
import { JobListing } from '@/types';

async function getJobs(): Promise<JobListing[]> {
    try {
        // Server-side fetch. Note: This request is unauthenticated.
        // It fetches PUBLIC jobs (equivalent to /jobs endpoint).
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

        // Remove trailing slash if exists
        if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

        // Ensure /api suffix if not present (simple heuristic, can be improved based on strict env rules)
        // However, standard env usually includes /api. 
        // If the error is "Cannot GET /jobs", it means the server received a request for "/jobs".
        // The server has Global Prefix "api", so it listens on "/api/jobs".
        // Thus, we must request "/api/jobs".

        // If apiUrl is just the domain, we need to append /api. 
        // Safest fix: Check if apiUrl ends with /api, if not, append it? 
        // Or assume env var is correct and maybe the default fallback was wrong? 
        // The default fallback in the code was 'http://localhost:4000/api'. This is correct.
        // So probably the Env var is set to 'http://localhost:4000' in the user's environment.

        // Let's just strictly use the path:
        const url = `${apiUrl}/jobs`;
        console.log("Fetching jobs from SSR:", url);

        const res = await fetch(url, {
            cache: 'no-store', // Ensure fresh data, or use revalidate for ISR
        });

        if (!res.ok) {
            console.error('Failed to fetch jobs', res.status);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

export default async function JobsPage() {
    const initialJobs = await getJobs();

    return (
        <JobsListClient initialJobs={initialJobs} />
    );
}

import JobsListClient from './JobsListClient';
import { JobListing } from '@/types';
import { API_URL } from '@/lib/constants';

async function getJobs(): Promise<JobListing[]> {
    try {
        // Server-side fetch. Note: This request is unauthenticated.
        // It fetches PUBLIC jobs (equivalent to /jobs endpoint).
        // API_URL from constants already includes '/api' suffix (e.g. http://localhost:4000/api)
        const url = `${API_URL}/jobs`;
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

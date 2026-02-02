import { db } from '../lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { INITIAL_TASKS, PROJECTS, CAMPAIGNS, ONBOARDING, PARTNERSHIPS, IT_ITEMS } from '../data/mockData';

export const seedMockData = async () => {
    try {
        console.log("Starting seed process...");
        const batch = writeBatch(db);

        // Seed Tasks
        INITIAL_TASKS.forEach(task => {
            const taskRef = doc(collection(db, 'tasks'), task.id);
            batch.set(taskRef, task);
        });

        // Seed Projects
        PROJECTS.forEach(project => {
            const projectRef = doc(collection(db, 'projects'), project.id);
            batch.set(projectRef, project);
        });

        // Seed Campaigns
        CAMPAIGNS.forEach(campaign => {
            const campaignRef = doc(collection(db, 'campaigns'), String(campaign.id));
            batch.set(campaignRef, campaign);
        });

        // Seed Onboarding
        ONBOARDING.forEach(item => {
            const itemRef = doc(collection(db, 'onboarding'), String(item.id));
            batch.set(itemRef, item);
        });

        // Seed Partnerships
        PARTNERSHIPS.forEach(item => {
            const itemRef = doc(collection(db, 'partnerships'), String(item.id));
            batch.set(itemRef, item);
        });

        // Seed IT Items
        IT_ITEMS.forEach(item => {
            const itemRef = doc(collection(db, 'it_items'), String(item.id));
            batch.set(itemRef, item);
        });

        await batch.commit();
        console.log("Seed complete!");
        return true;
    } catch (error) {
        console.error("Error seeding data:", error);
        return false;
    }
};

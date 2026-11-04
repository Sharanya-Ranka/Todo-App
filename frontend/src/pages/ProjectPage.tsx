import { Project } from "../components/Project";


interface ProjectPageProps {
  /** The root task ID representing the project (parentId === null) */
  taskId: string;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({ taskId }) => {
    // Placeholder for now
    return (
        <Project taskId={taskId} />
    )
}
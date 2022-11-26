#include<stdio.h>

void towerOfHanoi(int disks, char source, char intermediate, char destination)
{
	if (disks == 0)
	{
		return;
	}
	towerOfHanoi(disks-1, source, destination, intermediate);
	printf("Move disk %d from bar %c to bar %c\n", disks, source, destination);
	towerOfHanoi(disks-1,intermediate, source, destination);
}

int main()
{
	int disks;
	printf("Enter number of Disks : ");
	scanf("%d", &disks);
	printf("-----------SOLUTION------------\n");
	towerOfHanoi(disks, 'S', 'I', 'D');
	return 0;
}

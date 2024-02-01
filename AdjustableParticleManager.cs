using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AdjustableParticleManager : MonoBehaviour
{
    [Header("Options")]
    public float sizeX = 500;
    public float sizeY = 500;
    public float spawnX = 500;
    public float spawnY = 500;
    public float dt = 0.007f;
    public float friction = 0.01f;
    public float particleVisSize = 3;
    public int n = 450;
    public int m = 6;

    [Header("Debug Options")]
    public bool boundaryDebug = false;

    [Header("Visual Debug Options")]
    public bool showMin = false;
    public bool showMax = false;
    public bool showConnections = true;

    [Header("Physics Debug Options")]
    public bool randomizeOnInit = true;
    public bool pausePhysics = false;

    [Header("Universal Forces")]
    public float universalRepulsiveForce = 100f;
    public float maxDistance = 100f;
    public float minDistance = 15f;

    private float currentForce;
    private float d;

    public List<ParticleInfo> particles;
    public float[,] forceMatrix;
    public float[,] conversionMatrix;

    [Header("Shader")]
    public Shader circleShader;

    public class ParticleInfo
    {
        public GameObject go;
        public int famIdx;
        public float x;
        public float y;
        public float vx;
        public float vy;
        public List<ParticleInfo> inRange;

        public ParticleInfo(GameObject go, int famIdx, float x, float y, float vx, float vy, List<ParticleInfo> inRange)
        {
            this.go = go;
            this.famIdx = famIdx;
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.inRange = inRange;
        }
    }

    void Start()
    {
        InitializeForceMatrix(randomizeOnInit);
        print(forceMatrix);
        particles = GenerateParticles(n);
    }

    void FixedUpdate()
    {
        if (pausePhysics == false)
        {
            rule(n, particles, universalRepulsiveForce);
            updateParticles(particles);
        }
    }

    void InitializeForceMatrix(bool assignRand)
    {
        forceMatrix = new float[m, m];

        for (int i = 0; i < m; i++)
        {
            for (int j = 0; j < m; j++)
            {
                if (assignRand == true)
                {
                    forceMatrix[i, j] = Random.Range(-10, 11) * 10;
                }
                else
                {
                    forceMatrix[i, j] = 0.0f;
                }

            }
        }
    }

    public void UpdateForceMatrix(int row, int col, float value)
    {
        if (row >= 0 && row < m && col >= 0 && col < m)
        {
            forceMatrix[row, col] = value * 100;
        }
        else
        {
            Debug.LogError("Invalid row or column index for forceMatrix update.");
        }
    }

    void updateParticles(List<ParticleInfo> particles)
    {
        for (int i = 0; i < particles.Count; i++)
        {
            ParticleInfo a = particles[i];

            if (boundaryDebug == true)
            {
                a.x = Mathf.Repeat(a.x + sizeX, 2 * sizeX) - sizeX;
                a.y = Mathf.Repeat(a.y + sizeY, 2 * sizeY) - sizeY;
            }


            a.x += a.vx * dt;
            a.y += a.vy * dt;

            a.vx *= friction;
            a.vy *= friction;

            GameObject go = a.go;
            go.transform.position = new Vector3(a.x, 0f, a.y);
            go.transform.localScale = Vector3.one * particleVisSize;
        }
    }

    void rule(int n, List<ParticleInfo> p, float repulsion)
    {
        for (int i = 0; i < n; i++)
        {
            float fx = 0;
            float fy = 0;
            ParticleInfo a = p[i];

            a.inRange.Clear();

            for (int j = 0; j < n; j++)
            {
                ParticleInfo b = p[j];

                if (b != a)
                {
                    // float dx = CalculateDelta(a.x, b.x, sizeX);
                    // float dy = CalculateDelta(a.y, b.y, sizeY);

                    float dx = a.x - b.x;
                    float dy = a.y - b.y;

                    float attraction = forceMatrix[a.famIdx, b.famIdx];

                    d = Mathf.Sqrt((dx * dx) + (dy * dy));

                    if (d <= maxDistance && d >= minDistance)
                    {
                        a.inRange.Add(b);
                        float t = Mathf.InverseLerp(minDistance, maxDistance, d);
                        currentForce = Mathf.InverseLerp(1, 0, Mathf.Abs(t - 0.5f) * 2) * attraction;
                    }
                    else if (d > maxDistance)
                    {
                        currentForce = 0;
                    }
                    else if (d < minDistance)
                    {
                        float t = Mathf.InverseLerp(minDistance, 0, d);
                        currentForce = t * repulsion;
                    }

                    if (d == 0)
                    {
                        Debug.LogError("Distance is equal to Zero!");
                    }

                    fx += dx / d * currentForce;
                    fy += dy / d * currentForce;
                }
            }

            fx *= maxDistance;
            fy *= maxDistance;

            a.vx += fx * dt;
            a.vy += fy * dt;
        }
    }

    float CalculateDelta(float x1, float x2, float boundary)
    {
        float dx1 = x2 - x1;
        float dx2 = (x2 + 0.5f * boundary) - x1;
        float dx3 = (x2 - 0.5f * boundary) - x1;

        float minDelta = Mathf.Min(Mathf.Abs(dx1), Mathf.Abs(dx2), Mathf.Abs(dx3));

        if (minDelta == Mathf.Abs(dx1))
            return dx1;
        else if (minDelta == Mathf.Abs(dx2))
            return dx2;
        else
            return dx3;
    }

    GameObject CreateParticle(Vector3 position, Color color)
    {
        GameObject particle = GameObject.CreatePrimitive(PrimitiveType.Quad);
        particle.transform.position = position;
        particle.transform.rotation = Quaternion.LookRotation(-Vector3.up);

        particle.transform.localScale = Vector3.one * particleVisSize;

        Collider collider = particle.GetComponent<Collider>();
        if (collider != null)
        {
            Destroy(collider);
        }

        Renderer renderer = particle.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.material = new Material(circleShader);
            renderer.material.color = color;
        }

        return particle;
    }

    List<ParticleInfo> GenerateParticles(float amount)
    {
        List<ParticleInfo> thisGroup = new List<ParticleInfo>();

        for (int i = 0; i < amount; i++)
        {
            float xPos = Random.Range(-spawnX, spawnX);
            float yPos = Random.Range(-spawnY, spawnY);
            int idx = Random.Range(0, m);

            Vector3 spawnPosition = new Vector3(xPos, 0f, yPos);

            Color pColor = Color.HSVToRGB(((float)idx / m), 1, 1);

            GameObject particle = CreateParticle(spawnPosition, pColor);

            ParticleInfo particleInfo = new ParticleInfo(particle, idx, xPos, yPos, 0, 0, new List<ParticleInfo>());

            thisGroup.Add(particleInfo);
        }

        return thisGroup;
    }

    void OnDrawGizmos()
    {
        Gizmos.color = Color.green;
        Gizmos.DrawWireCube(transform.position, new Vector3(sizeX * 2, 0, sizeY * 2));

        if (particles != null)
        {
            for (int i = 0; i < particles.Count; i++)
            {
                ParticleInfo a = particles[i];
                GameObject go = a.go;

                if (showMin == true)
                {
                    Gizmos.color = Color.red;
                    Gizmos.DrawWireSphere(go.transform.position, minDistance);
                }


                if (showMax == true)
                {
                    Gizmos.color = Color.green;
                    Gizmos.DrawWireSphere(go.transform.position, maxDistance);
                }

                for (int j = 0; j < a.inRange.Count; j++)
                {
                    Gizmos.color = Color.white;
                    Gizmos.DrawLine(go.transform.position, a.inRange[j].go.transform.position);
                }
            }
        }
    }
}
